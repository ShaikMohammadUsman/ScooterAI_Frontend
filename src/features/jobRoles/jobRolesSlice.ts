import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCompanyJobRolesWithTimeRange, JobRole, JobRoleWithTimeframe } from '@/lib/adminService';

export interface JobRoleState {
  jobRoles: JobRole[];
  jobRolesWithTimeframe: JobRoleWithTimeframe[];
  loading: boolean;
  error: string | null;
  hasLoaded: boolean; // Add flag to track if data has been loaded
  timeframeLoading: boolean;
  timeframeError: string | null;
  timeframeHasLoaded: boolean;
}

const initialState: JobRoleState = {
  jobRoles: [],
  jobRolesWithTimeframe: [],
  loading: false,
  error: null,
  hasLoaded: false,
  timeframeLoading: false,
  timeframeError: null,
  timeframeHasLoaded: false,
};

let inFlight = false;
let timeframeInFlight = false;

export const fetchJobRoles = createAsyncThunk(
  'jobRoles/fetchJobRoles',
  async (companyId: string, { rejectWithValue }) => {
    if (inFlight) {
      // Already fetching, skip duplicate call
      return;
    }
    inFlight = true;
    try {
      // Use the new timeframe endpoint with empty body for overall data
      const response = await getCompanyJobRolesWithTimeRange(companyId);
      return response.roles;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch job roles');
    } finally {
      inFlight = false;
    }
  }
);

export const fetchJobRolesWithTimeRange = createAsyncThunk(
  'jobRoles/fetchJobRolesWithTimeRange',
  async ({ companyId, fromTime, toTime }: { companyId: string; fromTime?: string; toTime?: string }, { rejectWithValue }) => {
    if (timeframeInFlight) {
      // Already fetching, skip duplicate call
      return;
    }
    timeframeInFlight = true;
    try {
      const response = await getCompanyJobRolesWithTimeRange(companyId, fromTime, toTime);
      return response.roles;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch job roles with timeframe');
    } finally {
      timeframeInFlight = false;
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
        // Also update the timeframe data since we're using the new endpoint
        state.jobRolesWithTimeframe = action.payload || [];
        state.timeframeHasLoaded = true;
      })
      .addCase(fetchJobRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchJobRolesWithTimeRange.pending, (state) => {
        state.timeframeLoading = true;
        state.timeframeError = null;
      })
      .addCase(fetchJobRolesWithTimeRange.fulfilled, (state, action) => {
        state.timeframeLoading = false;
        state.timeframeHasLoaded = true;
        state.jobRolesWithTimeframe = action.payload || [];
      })
      .addCase(fetchJobRolesWithTimeRange.rejected, (state, action) => {
        state.timeframeLoading = false;
        state.timeframeError = action.payload as string;
      });
  },
});

export default jobRolesSlice.reducer; 