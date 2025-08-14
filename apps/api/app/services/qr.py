import io
import qrcode
import logging
from typing import Optional, Tuple
from PIL import Image
from minio import Minio
from minio.error import S3Error
from ..config import settings

logger = logging.getLogger(__name__)

# Initialize MinIO client
def get_minio_client() -> Minio:
    """Get configured MinIO client"""
    endpoint = settings.S3_ENDPOINT.replace("http://", "").replace("https://", "")
    secure = settings.S3_ENDPOINT.startswith("https://")
    
    return Minio(
        endpoint=endpoint,
        access_key=settings.S3_ACCESS_KEY,
        secret_key=settings.S3_SECRET_KEY,
        secure=secure
    )


def ensure_bucket_exists(client: Minio, bucket_name: str) -> None:
    """Ensure S3 bucket exists, create if it doesn't"""
    try:
        if not client.bucket_exists(bucket_name):
            client.make_bucket(bucket_name)
            logger.info(f"Created bucket: {bucket_name}")
    except S3Error as e:
        logger.error(f"Error ensuring bucket exists: {e}")
        raise


def generate_qr_code(data: str, size: int = 10, border: int = 4) -> Image.Image:
    """
    Generate QR code image
    
    Args:
        data: Data to encode in QR code
        size: Size of each box in pixels
        border: Border size in boxes
    
    Returns:
        PIL Image object
    """
    qr = qrcode.QRCode(
        version=1,  # Controls size, 1 is smallest
        error_correction=qrcode.constants.ERROR_CORRECT_L,  # ~7% error correction
        box_size=size,
        border=border,
    )
    
    qr.add_data(data)
    qr.make(fit=True)
    
    # Create QR code image (black on white)
    img = qr.make_image(fill_color="black", back_color="white")
    return img


def store_qr_code(short_id: str, formats: list = None) -> dict:
    """
    Generate and store QR code for a tag
    
    Args:
        short_id: Tag short ID
        formats: List of formats to generate ["png", "svg"]
    
    Returns:
        Dictionary with URLs for each format
    """
    if formats is None:
        formats = ["png"]
    
    client = get_minio_client()
    ensure_bucket_exists(client, settings.S3_BUCKET)
    
    # Generate the QR code URL
    qr_url = f"{settings.PUBLIC_CDN_BASE}/e/{short_id}"
    
    results = {}
    
    for fmt in formats:
        try:
            if fmt == "png":
                # Generate PNG QR code
                img = generate_qr_code(qr_url)
                
                # Convert to bytes
                img_buffer = io.BytesIO()
                img.save(img_buffer, format="PNG")
                img_buffer.seek(0)
                
                # Upload to S3
                key = f"qr/{short_id}.png"
                client.put_object(
                    settings.S3_BUCKET,
                    key,
                    img_buffer,
                    length=len(img_buffer.getvalue()),
                    content_type="image/png"
                )
                
                results["png"] = f"{settings.S3_PUBLIC_BASE}/{key}"
                
            elif fmt == "svg":
                # Generate SVG QR code
                import qrcode.image.svg
                
                factory = qrcode.image.svg.SvgPathImage
                img = qrcode.make(qr_url, image_factory=factory)
                
                # Convert to bytes
                svg_buffer = io.BytesIO()
                img.save(svg_buffer)
                svg_buffer.seek(0)
                
                # Upload to S3
                key = f"qr/{short_id}.svg"
                client.put_object(
                    settings.S3_BUCKET,
                    key,
                    svg_buffer,
                    length=len(svg_buffer.getvalue()),
                    content_type="image/svg+xml"
                )
                
                results["svg"] = f"{settings.S3_PUBLIC_BASE}/{key}"
                
        except Exception as e:
            logger.error(f"Error generating {fmt} QR code for {short_id}: {e}")
            continue
    
    return results


def delete_qr_code(short_id: str) -> bool:
    """
    Delete QR code files from S3
    
    Args:
        short_id: Tag short ID
    
    Returns:
        True if successful
    """
    try:
        client = get_minio_client()
        
        # Try to delete both PNG and SVG versions
        for fmt in ["png", "svg"]:
            key = f"qr/{short_id}.{fmt}"
            try:
                client.remove_object(settings.S3_BUCKET, key)
            except S3Error:
                pass  # File might not exist, that's ok
        
        return True
        
    except Exception as e:
        logger.error(f"Error deleting QR code for {short_id}: {e}")
        return False


def generate_qr_with_logo(short_id: str, logo_path: Optional[str] = None) -> str:
    """
    Generate QR code with optional logo overlay
    
    Args:
        short_id: Tag short ID
        logo_path: Path to logo file (optional)
    
    Returns:
        URL to the generated QR code
    """
    qr_url = f"{settings.PUBLIC_CDN_BASE}/e/{short_id}"
    
    # Generate base QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction for logo overlay
        box_size=10,
        border=4,
    )
    
    qr.add_data(qr_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Add logo if provided
    if logo_path:
        try:
            logo = Image.open(logo_path)
            
            # Calculate logo size (max 10% of QR code)
            qr_width, qr_height = img.size
            logo_size = min(qr_width, qr_height) // 10
            
            # Resize logo
            logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
            
            # Paste logo in center
            logo_pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)
            img.paste(logo, logo_pos)
            
        except Exception as e:
            logger.warning(f"Could not add logo to QR code: {e}")
    
    # Store the QR code
    try:
        client = get_minio_client()
        ensure_bucket_exists(client, settings.S3_BUCKET)
        
        img_buffer = io.BytesIO()
        img.save(img_buffer, format="PNG")
        img_buffer.seek(0)
        
        key = f"qr/{short_id}_logo.png"
        client.put_object(
            settings.S3_BUCKET,
            key,
            img_buffer,
            length=len(img_buffer.getvalue()),
            content_type="image/png"
        )
        
        return f"{settings.S3_PUBLIC_BASE}/{key}"
        
    except Exception as e:
        logger.error(f"Error storing QR code with logo for {short_id}: {e}")
        raise