import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Divider,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { user } = useAuth();
  const [suqabaToken, setSuqabaToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSaveSuqabaToken = async () => {
    setError('');
    setMessage('');

    try {
      // Save Suqaba token API call would go here
      setMessage('Suqaba account linked successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to link Suqaba account');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* User Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Box sx={{ '& > *': { mb: 2 } }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={user?.name || ''}
                  disabled
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={user?.email || ''}
                  disabled
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Job Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Simulation Statistics
              </Typography>
              <Box sx={{ '& > *': { mb: 1 } }}>
                <Typography variant="body2">
                  <strong>Completed Jobs:</strong> {user?.jobCounts?.completed || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Processing Jobs:</strong> {user?.jobCounts?.processing || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Queued Jobs:</strong> {user?.jobCounts?.queued || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Total Jobs:</strong>{' '}
                  {(user?.jobCounts?.completed || 0) +
                   (user?.jobCounts?.processing || 0) +
                   (user?.jobCounts?.queued || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Suqaba Account Linking */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Suqaba Account Integration
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Link your Suqaba.com account to access the full simulation platform with
                certified error verification.
              </Typography>

              {message && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  1. Create or login to your Suqaba account
                </Typography>
                <Link
                  href="https://suqaba.com/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sign up at suqaba.com
                </Link>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  2. Get your API token from your Suqaba dashboard
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Navigate to your account settings to generate an API token
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  3. Enter your API token below
                </Typography>
                <TextField
                  fullWidth
                  label="Suqaba API Token"
                  type="password"
                  value={suqabaToken}
                  onChange={(e) => setSuqabaToken(e.target.value)}
                  placeholder="Enter your Suqaba API token"
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleSaveSuqabaToken}
                  disabled={!suqabaToken.trim()}
                >
                  Link Suqaba Account
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Benefits of Linking Your Account
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" gutterBottom>
                  Access to cloud-based FEM simulation
                </Typography>
                <Typography component="li" variant="body2" gutterBottom>
                  Automated mesh generation and refinement
                </Typography>
                <Typography component="li" variant="body2" gutterBottom>
                  Certified error verification with Quality Oracle
                </Typography>
                <Typography component="li" variant="body2" gutterBottom>
                  Real-time job monitoring and status updates
                </Typography>
                <Typography component="li" variant="body2" gutterBottom>
                  Download and visualization of simulation results
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Help & Support */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Help & Support
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Documentation
                  </Typography>
                  <Link
                    href="https://youtube.com/playlist?list=PLDs89bTacmzVPuK0SwfxOo5KqCiULLm3x"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Suqaba Tutorials
                  </Link>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Support
                  </Typography>
                  <Link href="mailto:support@suqaba.com">
                    support@suqaba.com
                  </Link>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;