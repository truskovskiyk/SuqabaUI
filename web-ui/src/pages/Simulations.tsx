import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  MoreVert,
  PlayArrow,
  Pause,
  Stop,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Simulation {
  id: string;
  name: string;
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  analysisType: string;
  errorThreshold: number;
  qualityOracle?: number;
}

function Simulations() {
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSimulation, setSelectedSimulation] = useState<string | null>(null);

  useEffect(() => {
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    try {
      const response = await axios.get('/simulations');
      setSimulations(response.data);
    } catch (error) {
      console.error('Failed to load simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, simulationId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedSimulation(simulationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSimulation(null);
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
      case 'cancelled':
        return 'default';
      case 'draft':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleViewSimulation = (id: string) => {
    navigate(`/simulations/${id}`);
    handleMenuClose();
  };

  const handleDeleteSimulation = async (id: string) => {
    try {
      await axios.delete(`/simulations/${id}`);
      setSimulations(prev => prev.filter(sim => sim.id !== id));
    } catch (error) {
      console.error('Failed to delete simulation:', error);
    }
    handleMenuClose();
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Simulations
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/simulations/new')}
        >
          New Simulation
        </Button>
      </Box>

      {simulations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No simulations yet
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Create your first simulation to get started with Suqaba's certified error verification.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/simulations/new')}
          >
            Create First Simulation
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Analysis Type</TableCell>
                <TableCell>Error Threshold</TableCell>
                <TableCell>Quality Oracle</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {simulations.map((simulation) => (
                <TableRow
                  key={simulation.id}
                  hover
                  onClick={() => navigate(`/simulations/${simulation.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{simulation.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={simulation.status}
                      color={getStatusColor(simulation.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{simulation.analysisType}</TableCell>
                  <TableCell>{simulation.errorThreshold}%</TableCell>
                  <TableCell>
                    {simulation.qualityOracle ? `${simulation.qualityOracle}%` : '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(simulation.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, simulation.id)}
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedSimulation && handleViewSimulation(selectedSimulation)}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => console.log('Start simulation')}>
          <PlayArrow sx={{ mr: 1 }} />
          Start
        </MenuItem>
        <MenuItem onClick={() => console.log('Pause simulation')}>
          <Pause sx={{ mr: 1 }} />
          Pause
        </MenuItem>
        <MenuItem onClick={() => console.log('Stop simulation')}>
          <Stop sx={{ mr: 1 }} />
          Stop
        </MenuItem>
        <MenuItem 
          onClick={() => selectedSimulation && handleDeleteSimulation(selectedSimulation)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
}

export default Simulations;