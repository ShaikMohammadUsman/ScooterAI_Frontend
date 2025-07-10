import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCompanyJobRoles, JobRole } from '@/lib/adminService';

export interface JobRoleState {
  jobRoles: JobRole[];
  loading: boolean;
  error: string | null;
  hasLoaded: boolean; // Add flag to track if data has been loaded
}

const initialState: JobRoleState = {
  jobRoles: [],
  loading: false,
  error: null,
  hasLoaded: false,
};

let inFlight = false;

export const fetchJobRoles = createAsyncThunk(
  'jobRoles/fetchJobRoles',
  async (companyId: string, { rejectWithValue }) => {
    if (inFlight) {
      // Already fetching, skip duplicate call
      return;
    }
    inFlight = true;
    try {
      const response = await getCompanyJobRoles(companyId);
      return response.roles;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch job roles');
    } finally {
      inFlight = false;
    }
  }
);

const jobRolesSlice = createSlice({
  name: 'jobRoles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.hasLoaded = true; // Mark as loaded
        // Always update jobRoles, even if it's an empty array
        state.jobRoles = action.payload || [];
      })
      .addCase(fetchJobRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default jobRolesSlice.reducer; 