import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from '@mui/material';
import { CloudUpload, PlayArrow, Save } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SimulationForm {
  name: string;
  description: string;
  analysisType: string;
  errorThreshold: number;
  materials: string;
  boundaryConditions: string;
  file?: File;
}

const analysisTypes = [
  { value: 'static', label: 'Static Linear Elastic' },
  { value: 'dynamic', label: 'Dynamic Analysis' },
  { value: 'thermal', label: 'Thermal Analysis' },
];

const steps = ['Upload Geometry', 'Configure Analysis', 'Review & Submit'];

function NewSimulation() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<SimulationForm>({
    name: '',
    description: '',
    analysisType: 'static',
    errorThreshold: 20,
    materials: '',
    boundaryConditions: '',
  });

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'application/octet-stream': ['.step', '.stp', '.iges', '.igs'],
      'text/plain': ['.inp', '.dat'],
    },
    maxFiles: 1,
    onDrop: (files) => {
      if (files.length > 0) {
        setForm(prev => ({ ...prev, file: files[0] }));
        setActiveStep(1);
      }
    },
  });

  const handleInputChange = (field: keyof SimulationForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('analysisType', form.analysisType);
      formData.append('errorThreshold', form.errorThreshold.toString());
      formData.append('materials', form.materials);
      formData.append('boundaryConditions', form.boundaryConditions);
      
      if (form.file) {
        formData.append('geometry', form.file);
      }

      const response = await axios.post('/simulations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Simulation created successfully!');
      setTimeout(() => {
        navigate(`/simulations/${response.data.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create simulation');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Geometry File
              </Typography>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? '#f5f5f5' : 'white',
                  '&:hover': {
                    backgroundColor: '#f9f9f9',
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                {isDragActive ? (
                  <Typography>Drop the file here...</Typography>
                ) : (
                  <Box>
                    <Typography gutterBottom>
                      Drag & drop a geometry file here, or click to select
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Supported formats: STEP (.step, .stp), IGES (.iges, .igs), FEM Input (.inp, .dat)
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {acceptedFiles.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2">Selected file:</Typography>
                  <Typography>{acceptedFiles[0].name}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analysis Configuration
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Simulation Name"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={form.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Analysis Type</InputLabel>
                    <Select
                      value={form.analysisType}
                      label="Analysis Type"
                      onChange={(e) => handleInputChange('analysisType', e.target.value)}
                    >
                      {analysisTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Error Threshold (%)"
                    type="number"
                    value={form.errorThreshold}
                    onChange={(e) => handleInputChange('errorThreshold', parseFloat(e.target.value))}
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Materials"
                    multiline
                    rows={3}
                    value={form.materials}
                    onChange={(e) => handleInputChange('materials', e.target.value)}
                    placeholder="Define materials (e.g., Steel: E=200GPa, v=0.3, density=7850 kg/m³)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Boundary Conditions"
                    multiline
                    rows={3}
                    value={form.boundaryConditions}
                    onChange={(e) => handleInputChange('boundaryConditions', e.target.value)}
                    placeholder="Define loads and constraints"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Simulation
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Name:</Typography>
                  <Typography>{form.name}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description:</Typography>
                  <Typography>{form.description}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2">Analysis Type:</Typography>
                  <Typography>
                    {analysisTypes.find(t => t.value === form.analysisType)?.label}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2">Error Threshold:</Typography>
                  <Typography>{form.errorThreshold}%</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2">Geometry File:</Typography>
                  <Typography>{form.file?.name}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2">Materials:</Typography>
                  <Typography>{form.materials || 'None specified'}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2">Boundary Conditions:</Typography>
                  <Typography>{form.boundaryConditions || 'None specified'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        New Simulation
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {renderStepContent()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Box>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 0 && !form.file}
              >
                Next
              </Button>
            ) : (
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={() => {/* Save as draft */}}
                >
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={handleSubmit}
                  disabled={loading || !form.name}
                >
                  {loading ? <CircularProgress size={20} /> : 'Submit Simulation'}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default NewSimulation;