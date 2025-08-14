"""Initial database schema

Revision ID: 0001_initial
Revises: 
Create Date: 2024-08-14 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable extensions
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('webauthn_pubkey', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('gdpr_consent_at', sa.DateTime(), nullable=True),
        sa.Column('data_retention_until', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # Profiles table
    op.create_table(
        'profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('alias', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column('yob', sa.Integer(), nullable=True),
        sa.Column('blood_type', sqlmodel.sql.sqltypes.AutoString(length=3), nullable=True),
        sa.Column('rh_factor', sqlmodel.sql.sqltypes.AutoString(length=1), nullable=True),
        sa.Column('donor_status', sa.Boolean(), nullable=True),
        sa.Column('primary_langs', sa.JSON(), nullable=False),
        sa.Column('ice_name', sqlmodel.sql.sqltypes.AutoString(length=200), nullable=True),
        sa.Column('ice_phone', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column('ice_relationship', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True),
        sa.Column('public_alias', sa.Boolean(), nullable=False),
        sa.Column('public_yob', sa.Boolean(), nullable=False),
        sa.Column('public_blood', sa.Boolean(), nullable=False),
        sa.Column('public_languages', sa.Boolean(), nullable=False),
        sa.Column('public_ice', sa.Boolean(), nullable=False),
        sa.Column('last_updated_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_profiles_user_id'), 'profiles', ['user_id'], unique=False)
    
    # Tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('profile_id', sa.Integer(), nullable=False),
        sa.Column('short_id', sqlmodel.sql.sqltypes.AutoString(length=32), nullable=False),
        sa.Column('tag_type', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column('physical_id', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True),
        sa.Column('status', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column('qr_generated', sa.Boolean(), nullable=False),
        sa.Column('qr_s3_key', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('pdf_generated', sa.Boolean(), nullable=False),
        sa.Column('pdf_s3_key', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('activated_at', sa.DateTime(), nullable=True),
        sa.Column('revoked_at', sa.DateTime(), nullable=True),
        sa.Column('scan_count', sa.Integer(), nullable=False),
        sa.Column('last_scanned_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['profile_id'], ['profiles.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('short_id')
    )
    op.create_index(op.f('ix_tags_profile_id'), 'tags', ['profile_id'], unique=False)
    op.create_index(op.f('ix_tags_short_id'), 'tags', ['short_id'], unique=True)
    
    # Medical tables
    op.create_table(
        'conditions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('profile_id', sa.Integer(), nullable=False),
        sa.Column('code_system', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column('code', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column('display', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=False),
        sa.Column('notes', sqlmodel.sql.sqltypes.AutoString(length=1000), nullable=True),
        sa.Column('severity', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=False),
        sa.Column('coded', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['profile_id'], ['profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conditions_profile_id'), 'conditions', ['profile_id'], unique=False)
    
    op.create_table(
        'allergies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('profile_id', sa.Integer(), nullable=False),
        sa.Column('substance_system', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column('substance_code', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column('display', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=False),
        sa.Column('reaction', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=True),
        sa.Column('severity', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=True),
        sa.Column('onset', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=False),
        sa.Column('coded', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['profile_id'], ['profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_allergies_profile_id'), 'allergies', ['profile_id'], unique=False)
    
    op.create_table(
        'medications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('profile_id', sa.Integer(), nullable=False),
        sa.Column('drug_system', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column('drug_code', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column('display', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=False),
        sa.Column('dose', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True),
        sa.Column('route', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column('frequency', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True),
        sa.Column('status', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column('is_public', sa.Boolean(), nullable=False),
        sa.Column('coded', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['profile_id'], ['profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_medications_profile_id'), 'medications', ['profile_id'], unique=False)
    
    # Terminology tables
    op.create_table(
        'terminology_terms',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code_system', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('code', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('display_en', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=False),
        sa.Column('displays', sa.JSON(), nullable=True),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(length=1000), nullable=True),
        sa.Column('parent_code', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('search_terms', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_terminology_terms_code'), 'terminology_terms', ['code'], unique=False)
    op.create_index(op.f('ix_terminology_terms_code_system'), 'terminology_terms', ['code_system'], unique=False)
    op.create_index(op.f('ix_terminology_terms_parent_code'), 'terminology_terms', ['parent_code'], unique=False)
    
    op.create_table(
        'terminology_mappings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('from_system', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('from_code', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('to_system', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('to_code', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('equivalence', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column('mapping_source', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_terminology_mappings_from_code'), 'terminology_mappings', ['from_code'], unique=False)
    op.create_index(op.f('ix_terminology_mappings_from_system'), 'terminology_mappings', ['from_system'], unique=False)
    op.create_index(op.f('ix_terminology_mappings_to_code'), 'terminology_mappings', ['to_code'], unique=False)
    op.create_index(op.f('ix_terminology_mappings_to_system'), 'terminology_mappings', ['to_system'], unique=False)
    
    # Scan logs table
    op.create_table(
        'scan_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tag_id', sa.Integer(), nullable=False),
        sa.Column('ts', sa.DateTime(), nullable=False),
        sa.Column('country', sqlmodel.sql.sqltypes.AutoString(length=2), nullable=True),
        sa.Column('user_agent_hash', sqlmodel.sql.sqltypes.AutoString(length=32), nullable=True),
        sa.Column('referer_domain', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True),
        sa.Column('scan_method', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column('ip_hash', sqlmodel.sql.sqltypes.AutoString(length=32), nullable=True),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_scan_logs_ip_hash'), 'scan_logs', ['ip_hash'], unique=False)
    op.create_index(op.f('ix_scan_logs_tag_id'), 'scan_logs', ['tag_id'], unique=False)
    op.create_index(op.f('ix_scan_logs_ts'), 'scan_logs', ['ts'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('scan_logs')
    op.drop_table('terminology_mappings')
    op.drop_table('terminology_terms')
    op.drop_table('medications')
    op.drop_table('allergies')
    op.drop_table('conditions')
    op.drop_table('tags')
    op.drop_table('profiles')
    op.drop_table('users')