import requests
import json
import zipfile
import os
from typing import Dict, Any, Optional
from pathlib import Path

from app.core.config import settings

class SuqabaClient:
    """Client for interfacing with Suqaba solver backend"""
    
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = settings.SUQABA_API_URL
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
    
    async def authenticated_call(self, method: str, endpoint: str, **kwargs):
        """Make authenticated call to Suqaba API"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        if method.upper() == "GET":
            response = requests.get(url, headers=self.headers, **kwargs)
        elif method.upper() == "POST":
            response = requests.post(url, headers=self.headers, **kwargs)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        response.raise_for_status()
        return response.json()
    
    async def get_job_counts(self) -> Dict[str, int]:
        """Get user's job counts from Suqaba"""
        try:
            data = await self.authenticated_call("GET", "/jobs/counts")
            return {
                "completed": data.get("completed", 0),
                "processing": data.get("processing", 0),
                "queued": data.get("queued", 0)
            }
        except Exception:
            # Return default values if API call fails
            return {"completed": 0, "processing": 0, "queued": 0}
    
    async def submit_simulation(self, simulation_data: Dict[str, Any]) -> str:
        """Submit a new simulation to Suqaba"""
        # Create input files in Suqaba format
        input_files = self._create_suqaba_input_files(simulation_data)
        
        # Upload files and submit job
        files = {}
        for filename, content in input_files.items():
            files[filename] = content
        
        # Submit to Suqaba API
        response = await self.authenticated_call(
            "POST", 
            "/jobs/submit",
            files=files
        )
        
        return response.get("job_id")
    
    async def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get status of a specific job"""
        return await self.authenticated_call("GET", f"/jobs/{job_id}/status")
    
    async def download_results(self, job_id: str, output_dir: str) -> str:
        """Download simulation results"""
        response = requests.get(
            f"{self.base_url}/jobs/{job_id}/results",
            headers={"Authorization": f"Bearer {self.access_token}"},
            stream=True
        )
        response.raise_for_status()
        
        results_path = os.path.join(output_dir, f"results_{job_id}.zip")
        with open(results_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Extract results
        extract_dir = os.path.join(output_dir, f"results_{job_id}")
        with zipfile.ZipFile(results_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        return extract_dir
    
    def _create_suqaba_input_files(self, simulation_data: Dict[str, Any]) -> Dict[str, str]:
        """Create Suqaba input files from simulation data"""
        files = {}
        
        # Parameters file
        parameters = {
            "analysis_type": simulation_data.get("analysis_type", "static"),
            "error_threshold": simulation_data.get("error_threshold", 20.0),
        }
        files["parameters.json"] = json.dumps(parameters)
        
        # Materials file
        if simulation_data.get("materials"):
            files["materials.txt"] = simulation_data["materials"]
        
        # Boundary conditions file
        if simulation_data.get("boundary_conditions"):
            files["boundary_conditions.txt"] = simulation_data["boundary_conditions"]
        
        return files
    
    async def cancel_job(self, job_id: str) -> bool:
        """Cancel a running job"""
        try:
            await self.authenticated_call("POST", f"/jobs/{job_id}/cancel")
            return True
        except Exception:
            return False
    
    async def get_quality_oracle(self, job_id: str) -> Optional[float]:
        """Get Quality Oracle result for completed simulation"""
        try:
            data = await self.authenticated_call("GET", f"/jobs/{job_id}/quality-oracle")
            return data.get("quality_oracle")
        except Exception:
            return None

class SuqabaSimulationWriter:
    """Writer compatible with existing Suqaba solver format"""
    
    def __init__(self, simulation_data: Dict[str, Any], output_dir: str):
        self.simulation_data = simulation_data
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def write_input_files(self) -> Dict[str, str]:
        """Write input files in Suqaba format"""
        files_written = {}
        
        # Write parameters file
        params_file = self.output_dir / "suqaba_parameters.json"
        with open(params_file, 'w') as f:
            json.dump({
                "AnalysisType": self.simulation_data.get("analysis_type", "static"),
                "ErrorThreshold": self.simulation_data.get("error_threshold", 20.0),
            }, f, indent=2)
        files_written["parameters"] = str(params_file)
        
        # Write materials file
        if self.simulation_data.get("materials"):
            materials_file = self.output_dir / "suqaba_materials.txt"
            with open(materials_file, 'w') as f:
                f.write(self.simulation_data["materials"])
            files_written["materials"] = str(materials_file)
        
        # Write boundary conditions
        if self.simulation_data.get("boundary_conditions"):
            bc_file = self.output_dir / "suqaba_boundary_conditions.txt"
            with open(bc_file, 'w') as f:
                f.write(self.simulation_data["boundary_conditions"])
            files_written["boundary_conditions"] = str(bc_file)
        
        return files_written