import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Download,
  Assessment,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface SimulationDetail {
  id: string;
  name: string;
  description: string;
  status: string;
  analysisType: string;
  errorThreshold: number;
  materials: string;
  boundaryConditions: string;
  qualityOracle?: number;
  meshNodes?: number;
  meshElements?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  geometryFileName?: string;
  suqabaJobId?: string;
}

function SimulationDetail() {
  const { id } = useParams<{ id: string }>();
  const [simulation, setSimulation] = useState<SimulationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadSimulation(id);
    }
  }, [id]);

  const loadSimulation = async (simulationId: string) => {
    try {
      const response = await axios.get(`/simulations/${simulationId}`);
      setSimulation(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load simulation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'processing':
        return <Schedule color="warning" />;
      case 'queued':
        return <Schedule color="info" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <Schedule color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'queued':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleStartSimulation = async () => {
    if (!simulation) return;
    try {
      await axios.post(`/simulations/${simulation.id}/start`);
      loadSimulation(simulation.id);
    } catch (err) {
      console.error('Failed to start simulation:', err);
    }
  };

  const handleStopSimulation = async () => {
    if (!simulation) return;
    try {
      await axios.post(`/simulations/${simulation.id}/stop`);
      loadSimulation(simulation.id);
    } catch (err) {
      console.error('Failed to stop simulation:', err);
    }
  };

  const handleDownloadResults = async () => {
    if (!simulation) return;
    try {
      const response = await axios.get(`/simulations/${simulation.id}/results`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${simulation.name}_results.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download results:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !simulation) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'Simulation not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {simulation.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            {getStatusIcon(simulation.status)}
            <Chip
              label={simulation.status.toUpperCase()}
              color={getStatusColor(simulation.status) as any}
            />
            {simulation.suqabaJobId && (
              <Typography variant="body2" color="textSecondary">
                Job ID: {simulation.suqabaJobId}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box display="flex" gap={1}>
          {simulation.status === 'draft' && (
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={handleStartSimulation}
            >
              Start Simulation
            </Button>
          )}
          {(simulation.status === 'processing' || simulation.status === 'queued') && (
            <Button
              variant="outlined"
              startIcon={<Stop />}
              onClick={handleStopSimulation}
            >
              Stop
            </Button>
          )}
          {simulation.status === 'completed' && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownloadResults}
            >
              Download Results
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Simulation Details
              </Typography>
              <Box sx={{ '& > *': { mb: 1 } }}>
                <Typography variant="body2">
                  <strong>Analysis Type:</strong> {simulation.analysisType}
                </Typography>
                <Typography variant="body2">
                  <strong>Error Threshold:</strong> {simulation.errorThreshold}%
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {new Date(simulation.createdAt).toLocaleString()}
                </Typography>
                {simulation.startedAt && (
                  <Typography variant="body2">
                    <strong>Started:</strong> {new Date(simulation.startedAt).toLocaleString()}
                  </Typography>
                )}
                {simulation.completedAt && (
                  <Typography variant="body2">
                    <strong>Completed:</strong> {new Date(simulation.completedAt).toLocaleString()}
                  </Typography>
                )}
                {simulation.geometryFileName && (
                  <Typography variant="body2">
                    <strong>Geometry File:</strong> {simulation.geometryFileName}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quality Oracle & Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quality Oracle
              </Typography>
              {simulation.qualityOracle ? (
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Assessment color="primary" />
                    <Typography variant="h4" color="primary">
                      {simulation.qualityOracle}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={simulation.qualityOracle}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="textSecondary" mt={1}>
                    Confidence level in simulation results
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Quality Oracle will be available after simulation completion
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Mesh Information */}
        {(simulation.meshNodes || simulation.meshElements) && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mesh Information
                </Typography>
                <Box sx={{ '& > *': { mb: 1 } }}>
                  {simulation.meshNodes && (
                    <Typography variant="body2">
                      <strong>Nodes:</strong> {simulation.meshNodes.toLocaleString()}
                    </Typography>
                  )}
                  {simulation.meshElements && (
                    <Typography variant="body2">
                      <strong>Elements:</strong> {simulation.meshElements.toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Progress Indicator for Running Simulations */}
        {(simulation.status === 'processing' || simulation.status === 'queued') && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Simulation Progress
                </Typography>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="textSecondary">
                  {simulation.status === 'queued' 
                    ? 'Waiting in queue for processing...' 
                    : 'Simulation is currently running...'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Materials */}
        {simulation.materials && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Materials
                </Typography>
                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                  {simulation.materials}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Boundary Conditions */}
        {simulation.boundaryConditions && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Boundary Conditions
                </Typography>
                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                  {simulation.boundaryConditions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Description */}
        {simulation.description && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                  {simulation.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default SimulationDetail;