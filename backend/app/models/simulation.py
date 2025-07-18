from sqlalchemy import Column, String, Integer, DateTime, Float, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base

class SimulationStatus(str, enum.Enum):
    DRAFT = "draft"
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class AnalysisType(str, enum.Enum):
    STATIC = "static"
    DYNAMIC = "dynamic"
    THERMAL = "thermal"

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Basic info
    name = Column(String, nullable=False)
    description = Column(Text)
    status = Column(Enum(SimulationStatus), default=SimulationStatus.DRAFT)
    
    # Analysis configuration
    analysis_type = Column(Enum(AnalysisType), default=AnalysisType.STATIC)
    error_threshold = Column(Float, default=20.0)
    
    # Materials and boundary conditions
    materials = Column(Text)
    boundary_conditions = Column(Text)
    
    # File paths
    geometry_file_path = Column(String)
    input_file_path = Column(String)
    results_file_path = Column(String)
    
    # Suqaba-specific data
    suqaba_job_id = Column(String)
    quality_oracle = Column(Float)
    mesh_nodes = Column(Integer)
    mesh_elements = Column(Integer)
    convergence_data = Column(Text)  # JSON string
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="simulations")

# Add reverse relationship to User model
from app.models.user import User
User.simulations = relationship("Simulation", back_populates="user")