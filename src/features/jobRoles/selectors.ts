import { RootState } from '../../app/store';
import { JobRoleState } from './jobRolesSlice';

export const selectJobRoles = (state: RootState) => (state.jobRoles as JobRoleState).jobRoles;
export const selectJobRolesLoading = (state: RootState) => (state.jobRoles as JobRoleState).loading;
export const selectJobRolesError = (state: RootState) => (state.jobRoles as JobRoleState).error;
export const selectJobRolesHasLoaded = (state: RootState) => (state.jobRoles as JobRoleState).hasLoaded;

export const selectTotalCandidates = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRoles.reduce((acc: number, job: any) => acc + (job.total_candidates || 0), 0);

export const selectTotalAudioAttended = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRoles.reduce((acc: number, job: any) => acc + (job.audio_attended_count || 0), 0);

export const selectTotalVideoAttended = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRoles.reduce((acc: number, job: any) => acc + (job.video_attended_count || 0), 0);

export const selectTotalMovedToVideo = (state: RootState) =>
  (state.jobRoles as JobRoleState).jobRoles.reduce((acc: number, job: any) => acc + (job.moved_to_video_round_count || 0), 0);

export const selectAudioConversionRate = (state: RootState) => {
  const total = selectTotalCandidates(state);
  const audio = selectTotalAudioAttended(state);
  return total > 0 ? ((audio / total) * 100).toFixed(1) : '0';
};

export const selectVideoConversionRate = (state: RootState) => {
  const audio = selectTotalAudioAttended(state);
  const video = selectTotalVideoAttended(state);
  return audio > 0 ? ((video / audio) * 100).toFixed(1) : '0';
};

export const selectOverallConversionRate = (state: RootState) => {
  const total = selectTotalCandidates(state);
  const moved = selectTotalMovedToVideo(state);
  return total > 0 ? ((moved / total) * 100).toFixed(1) : '0';
}; 