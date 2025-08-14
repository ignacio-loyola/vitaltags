import io
import logging
from datetime import datetime
from typing import Optional, List
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.units import mm, inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from minio import Minio
from ..config import settings
from .qr import get_minio_client, ensure_bucket_exists

logger = logging.getLogger(__name__)


def generate_tag_stickers_pdf(
    tags_data: List[dict],
    page_size: tuple = A4,
    stickers_per_row: int = 2,
    stickers_per_col: int = 5
) -> bytes:
    """
    Generate PDF with multiple QR code stickers for printing
    
    Args:
        tags_data: List of tag dictionaries with 'short_id', 'qr_url', 'alias' etc.
        page_size: PDF page size (default A4)
        stickers_per_row: Number of stickers per row
        stickers_per_col: Number of stickers per column
    
    Returns:
        PDF as bytes
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=page_size, 
                          leftMargin=10*mm, rightMargin=10*mm,
                          topMargin=10*mm, bottomMargin=10*mm)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=12,
        textColor=colors.black,
        alignment=TA_CENTER,
        spaceAfter=3*mm
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER,
        spaceBefore=0,
        spaceAfter=2*mm
    )
    
    # Page title
    story.append(Paragraph("Vital Tags - Emergency Medical Information", title_style))
    story.append(Spacer(1, 5*mm))
    
    # Calculate sticker dimensions
    page_width, page_height = page_size
    usable_width = page_width - 20*mm  # margins
    usable_height = page_height - 40*mm  # margins + title space
    
    sticker_width = usable_width / stickers_per_row
    sticker_height = usable_height / stickers_per_col
    
    # Process tags in batches for each page
    stickers_per_page = stickers_per_row * stickers_per_col
    
    for page_start in range(0, len(tags_data), stickers_per_page):
        page_tags = tags_data[page_start:page_start + stickers_per_page]
        
        # Create table for stickers
        table_data = []
        for row in range(stickers_per_col):
            row_data = []
            for col in range(stickers_per_row):
                tag_index = row * stickers_per_row + col
                
                if tag_index < len(page_tags):
                    tag = page_tags[tag_index]
                    sticker_content = create_sticker_content(tag, sticker_width, sticker_height)
                    row_data.append(sticker_content)
                else:
                    row_data.append("")  # Empty cell
            
            table_data.append(row_data)
        
        # Create and style table
        table = Table(table_data, colWidths=[sticker_width] * stickers_per_row,
                     rowHeights=[sticker_height] * stickers_per_col)
        
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ('LEFTPADDING', (0, 0), (-1, -1), 2*mm),
            ('RIGHTPADDING', (0, 0), (-1, -1), 2*mm),
            ('TOPPADDING', (0, 0), (-1, -1), 2*mm),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2*mm),
        ]))
        
        story.append(table)
        
        # Add page break if more tags remain
        if page_start + stickers_per_page < len(tags_data):
            story.append(PageBreak())
    
    # Build PDF
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes


def create_sticker_content(tag_data: dict, width: float, height: float) -> List:
    """Create content for a single sticker"""
    content = []
    styles = getSampleStyleSheet()
    
    # QR Code (if available)
    if tag_data.get('qr_url'):
        # In a real implementation, you'd fetch the QR code image
        # For now, we'll add a placeholder
        qr_placeholder = Paragraph(f"[QR: {tag_data['short_id']}]", 
                                 styles['Normal'])
        content.append(qr_placeholder)
    
    # Tag ID
    content.append(Paragraph(f"ID: {tag_data['short_id']}", 
                           styles['Normal']))
    
    # Alias
    if tag_data.get('alias'):
        content.append(Paragraph(f"{tag_data['alias']}", 
                               styles['Heading3']))
    
    # URL
    url = f"{settings.PUBLIC_CDN_BASE}/e/{tag_data['short_id']}"
    content.append(Paragraph(f"Scan or visit: {url}", 
                           styles['Normal']))
    
    return content


def generate_single_tag_pdf(short_id: str, alias: str, qr_image_path: Optional[str] = None) -> bytes:
    """
    Generate PDF for a single tag with QR code
    
    Args:
        short_id: Tag short ID
        alias: Profile alias
        qr_image_path: Path to QR code image file
    
    Returns:
        PDF as bytes
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Title
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredText(width/2, height - 50, "Vital Tags")
    
    c.setFont("Helvetica", 16)
    c.drawCentredText(width/2, height - 80, "Emergency Medical Information")
    
    # QR Code area
    qr_size = 200
    qr_x = width/2 - qr_size/2
    qr_y = height/2 - qr_size/2
    
    if qr_image_path:
        try:
            c.drawImage(qr_image_path, qr_x, qr_y, qr_size, qr_size)
        except:
            # Fallback if image can't be loaded
            c.rect(qr_x, qr_y, qr_size, qr_size)
            c.drawCentredText(width/2, height/2, f"QR Code for {short_id}")
    else:
        c.rect(qr_x, qr_y, qr_size, qr_size)
        c.drawCentredText(width/2, height/2, f"QR Code for {short_id}")
    
    # Tag information
    c.setFont("Helvetica", 14)
    y_pos = qr_y - 40
    
    c.drawCentredText(width/2, y_pos, f"Tag ID: {short_id}")
    y_pos -= 25
    
    if alias:
        c.drawCentredText(width/2, y_pos, f"Alias: {alias}")
        y_pos -= 25
    
    # URL
    url = f"{settings.PUBLIC_CDN_BASE}/e/{short_id}"
    c.setFont("Helvetica", 12)
    c.drawCentredText(width/2, y_pos, f"Emergency URL: {url}")
    
    # Instructions
    y_pos -= 60
    c.setFont("Helvetica", 10)
    instructions = [
        "EMERGENCY INSTRUCTIONS:",
        "1. Scan this QR code with any smartphone camera",
        "2. Or visit the URL above in any web browser", 
        "3. Access critical medical information instantly",
        "",
        "Keep this tag with you at all times.",
        "In case of emergency, first responders can access your medical info."
    ]
    
    for instruction in instructions:
        c.drawCentredText(width/2, y_pos, instruction)
        y_pos -= 15
    
    # Footer
    c.setFont("Helvetica", 8)
    c.drawCentredText(width/2, 30, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
    c.drawCentredText(width/2, 15, "Vital Tags - Privacy-first emergency medical information")
    
    c.save()
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes


def store_pdf(short_id: str, pdf_bytes: bytes, pdf_type: str = "tag") -> str:
    """
    Store PDF in S3 storage
    
    Args:
        short_id: Tag short ID
        pdf_bytes: PDF content as bytes
        pdf_type: Type of PDF ("tag", "stickers")
    
    Returns:
        URL to stored PDF
    """
    try:
        client = get_minio_client()
        ensure_bucket_exists(client, settings.S3_BUCKET)
        
        # Create key based on type
        if pdf_type == "stickers":
            key = f"pdf/stickers_{short_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"
        else:
            key = f"pdf/{short_id}.pdf"
        
        # Upload PDF
        pdf_buffer = io.BytesIO(pdf_bytes)
        client.put_object(
            settings.S3_BUCKET,
            key,
            pdf_buffer,
            length=len(pdf_bytes),
            content_type="application/pdf"
        )
        
        return f"{settings.S3_PUBLIC_BASE}/{key}"
        
    except Exception as e:
        logger.error(f"Error storing PDF for {short_id}: {e}")
        raise


def delete_pdf(short_id: str) -> bool:
    """
    Delete PDF files from S3
    
    Args:
        short_id: Tag short ID
    
    Returns:
        True if successful
    """
    try:
        client = get_minio_client()
        
        # Delete main tag PDF
        key = f"pdf/{short_id}.pdf"
        try:
            client.remove_object(settings.S3_BUCKET, key)
        except:
            pass  # File might not exist
        
        return True
        
    except Exception as e:
        logger.error(f"Error deleting PDF for {short_id}: {e}")
        return False