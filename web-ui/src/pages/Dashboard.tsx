import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  PlayArrow,
  CheckCircle,
  Schedule,
  Error,
  Assessment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Simulation {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  errorThreshold?: number;
  qualityOracle?: number;
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [recentSimulations, setRecentSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [simulationsResponse] = await Promise.all([
        axios.get('/simulations?limit=5'),
        refreshUserData(),
      ]);
      setRecentSimulations(simulationsResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'processing':
        return <PlayArrow color="warning" />;
      case 'queued':
        return <Schedule color="info" />;
      case 'failed':
        return <Error color="error" />;
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
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completed Jobs
                  </Typography>
                  <Typography variant="h4">
                    {user?.jobCounts?.completed || 0}
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Processing
                  </Typography>
                  <Typography variant="h4">
                    {user?.jobCounts?.processing || 0}
                  </Typography>
                </Box>
                <PlayArrow color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Queued
                  </Typography>
                  <Typography variant="h4">
                    {user?.jobCounts?.queued || 0}
                  </Typography>
                </Box>
                <Schedule color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Jobs
                  </Typography>
                  <Typography variant="h4">
                    {(user?.jobCounts?.completed || 0) + 
                     (user?.jobCounts?.processing || 0) + 
                     (user?.jobCounts?.queued || 0)}
                  </Typography>
                </Box>
                <Assessment color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/simulations/new')}
                fullWidth
              >
                New Simulation
              </Button>
              <Button
                variant="outlined"
                startIcon={<Assessment />}
                onClick={() => navigate('/simulations')}
                fullWidth
              >
                View All Simulations
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Simulations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Simulations
            </Typography>
            {recentSimulations.length === 0 ? (
              <Typography color="textSecondary">
                No simulations yet. Create your first simulation to get started!
              </Typography>
            ) : (
              <List>
                {recentSimulations.map((simulation) => (
                  <ListItem
                    key={simulation.id}
                    divider
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/simulations/${simulation.id}`)}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          {getStatusIcon(simulation.status)}
                          <Typography variant="subtitle1">
                            {simulation.name}
                          </Typography>
                          <Chip
                            label={simulation.status}
                            color={getStatusColor(simulation.status) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Created: {new Date(simulation.createdAt).toLocaleDateString()}
                          </Typography>
                          {simulation.qualityOracle && (
                            <Typography variant="body2" color="textSecondary">
                              Quality Oracle: {simulation.qualityOracle}%
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Information Panel */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              About Suqaba
            </Typography>
            <Typography variant="body1" paragraph>
              Suqaba is the first simulation software with built-in Certified Error Verification. 
              Our platform provides automated mesh generation and refinement with error-driven 
              adaptive meshing, ensuring quality and trust in digital design.
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip label="Automated Mesh Generation" color="primary" variant="outlined" />
              <Chip label="Error-driven Adaptive Meshing" color="primary" variant="outlined" />
              <Chip label="Cloud-native Platform" color="primary" variant="outlined" />
              <Chip label="Quality Oracle" color="primary" variant="outlined" />
              <Chip label="Certified Error Verification" color="primary" variant="outlined" />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;