import { RootState } from '../../app/store';
import { JobRoleState } from './jobRolesSlice';

export const selectJobRoles = (state: RootState) => (state.jobRoles as JobRoleState).jobRoles;
export const selectJobRolesLoading = (state: RootState) => (state.jobRoles as JobRoleState).loading;
export const selectJobRolesError = (state: RootState) => (state.jobRoles as JobRoleState).error;
export const selectJobRolesHasLoaded = (state: RootState) => (state.jobRoles as JobRoleState).hasLoaded;

// Timeframe selectors
export const selectJobRolesWithTimeframe = (state: RootState) => (state.jobRoles as JobRoleState).jobRolesWithTimeframe;
export const selectJobRolesTimeframeLoading = (state: RootState) => (state.jobRoles as JobRoleState).timeframeLoading;
export const selectJobRolesTimeframeError = (state: RootState) => (state.jobRoles as JobRoleState).timeframeError;
export const selectJobRolesTimeframeHasLoaded = (state: RootState) => (state.jobRoles as JobRoleState).timeframeHasLoaded;

// Overall selectors (using regular job roles)
export const selectTotalCandidates = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRoles.reduce((acc: number, job: any) => acc + (job.total_candidates || 0), 0);

export const selectTotalAudioAttended = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRoles.reduce((acc: number, job: any) => acc + (job.audio_attended_count || 0), 0);

export const selectTotalVideoAttended = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRoles.reduce((acc: number, job: any) => acc + (job.video_attended_count || 0), 0);

export const selectTotalVideoInvites = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRoles.reduce((acc: number, job: any) => acc + (job.moved_to_video_round_count || 0), 0);

// Timeframe selectors (using timeframe data)
export const selectTotalCandidatesTimeframe = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRolesWithTimeframe.reduce((acc: number, job: any) => acc + (job.timeframe?.total_candidates || 0), 0);

export const selectTotalAudioAttendedTimeframe = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRolesWithTimeframe.reduce((acc: number, job: any) => acc + (job.timeframe?.audio_attended || 0), 0);

export const selectTotalVideoAttendedTimeframe = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRolesWithTimeframe.reduce((acc: number, job: any) => acc + (job.timeframe?.video_attended || 0), 0);

export const selectTotalVideoInvitesTimeframe = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRolesWithTimeframe.reduce((acc: number, job: any) => acc + (job.timeframe?.moved_to_video_round || 0), 0);

// Overall timeframe selectors (using timeframe-first logic)
export const selectTotalCandidatesOverall = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRolesWithTimeframe.reduce((acc: number, job: any) => {
    const timeframeData = job.timeframe;
    const overallData = job.overall;
    // return acc + (timeframeData?.total_candidates ?? overallData?.total_candidates ?? 0);
    return acc + ( overallData?.total_candidates ?? 0);
  }, 0);

export const selectTotalAudioAttendedOverall = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRolesWithTimeframe.reduce((acc: number, job: any) => {
    const timeframeData = job.timeframe;
    const overallData = job.overall;
    // return acc + (timeframeData?.audio_attended ?? overallData?.audio_attended ?? 0);
    return acc + ( overallData?.audio_attended ?? 0);
  }, 0);

export const selectTotalVideoAttendedOverall = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRolesWithTimeframe.reduce((acc: number, job: any) => {
    const timeframeData = job.timeframe;
    const overallData = job.overall;
    // return acc + (timeframeData?.video_attended ?? overallData?.video_attended ?? 0);
    return acc + ( overallData?.video_attended ?? 0);
  }, 0);

export const selectTotalVideoInvitesOverall = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRolesWithTimeframe.reduce((acc: number, job: any) => {
    const timeframeData = job.timeframe;
    const overallData = job.overall;
    // return acc + (timeframeData?.moved_to_video_round ?? overallData?.moved_to_video_round ?? 0);
    return acc + ( overallData?.moved_to_video_round ?? 0);
  }, 0);

export const selectAudioConversionRate = (state: RootState) => {
  const total = selectTotalCandidates(state);
  const audio = selectTotalAudioAttended(state);
  return total > 0 ? ((audio / total) * 100).toFixed(1) : '0';
};

export const selectVideoInviteConversionRate = (state: RootState) => {
  const audio = selectTotalAudioAttended(state);
  const videoInvites = selectTotalVideoInvites(state);
  return audio > 0 ? ((videoInvites / audio) * 100).toFixed(1) : '0';
};

export const selectVideoCompletionConversionRate = (state: RootState) => {
  const videoInvites = selectTotalVideoInvites(state);
  const videoCompleted = selectTotalVideoAttended(state);
  return videoInvites > 0 ? ((videoCompleted / videoInvites) * 100).toFixed(1) : '0';
};

// Timeframe conversion rates
export const selectAudioConversionRateTimeframe = (state: RootState) => {
  const total = selectTotalCandidatesTimeframe(state);
  const audio = selectTotalAudioAttendedTimeframe(state);
  return total > 0 ? ((audio / total) * 100).toFixed(1) : '0';
};

export const selectVideoInviteConversionRateTimeframe = (state: RootState) => {
  const audio = selectTotalAudioAttendedTimeframe(state);
  const videoInvites = selectTotalVideoInvitesTimeframe(state);
  return audio > 0 ? ((videoInvites / audio) * 100).toFixed(1) : '0';
};

export const selectVideoCompletionConversionRateTimeframe = (state: RootState) => {
  const videoInvites = selectTotalVideoInvitesTimeframe(state);
  const videoCompleted = selectTotalVideoAttendedTimeframe(state);
  return videoInvites > 0 ? ((videoCompleted / videoInvites) * 100).toFixed(1) : '0';
};

// Overall conversion rates from timeframe data
export const selectAudioConversionRateOverall = (state: RootState) => {
  const total = selectTotalCandidatesOverall(state);
  const audio = selectTotalAudioAttendedOverall(state);
  return total > 0 ? ((audio / total) * 100).toFixed(1) : '0';
};

export const selectVideoInviteConversionRateOverall = (state: RootState) => {
  const audio = selectTotalAudioAttendedOverall(state);
  const videoInvites = selectTotalVideoInvitesOverall(state);
  return audio > 0 ? ((videoInvites / audio) * 100).toFixed(1) : '0';
};

export const selectVideoCompletionConversionRateOverall = (state: RootState) => {
  const videoInvites = selectTotalVideoInvitesOverall(state);
  const videoCompleted = selectTotalVideoAttendedOverall(state);
  return videoInvites > 0 ? ((videoCompleted / videoInvites) * 100).toFixed(1) : '0';
}; 