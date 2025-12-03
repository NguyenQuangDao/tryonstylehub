export type RangeOption = 'upper-body' | 'full-body';
export type PoseOption = 'standing' | 'walking' | 'hands-on-hips' | 'arms-crossed' | 'leaning';

export function getRangeCues(range: RangeOption): string {
  if (range === 'upper-body') {
    return [
      'upper body portrait',
      'subject centered',
      'from head to mid-torso visible',
      'arms and hands visible in frame',
      'single subject only',
      'one person',
      'solo portrait',
      'single frame',
      'plain neutral background',
      'uncluttered background'
    ].join(', ');
  }
  return [
    'full body portrait',
    'subject centered',
    'head-to-toe visible',
    'all limbs fully visible (hands and feet in frame)',
    'single subject only',
    'one person',
    'solo portrait',
    'single frame',
    'plain neutral background',
    'uncluttered background'
  ].join(', ');
}

export function getPoseCue(pose: PoseOption): string {
  switch (pose) {
    case 'walking':
      return 'natural walking pose, one foot forward, relaxed arms swing';
    case 'hands-on-hips':
      return 'standing pose, hands on hips, confident posture';
    case 'arms-crossed':
      return 'standing pose, arms crossed, balanced posture';
    case 'leaning':
      return 'standing pose, slight lean, relaxed posture';
    default:
      return 'natural standing pose, relaxed hands at sides';
  }
}

export function getVietnameseSummary(range: RangeOption, pose: PoseOption): string {
  const rangeVi = range === 'full-body' ? 'Toàn thân' : 'Nửa thân trên';
  const poseVi = pose === 'standing' ? 'Đứng thẳng, tay thả lỏng'
    : pose === 'walking' ? 'Bước nhẹ, tay vung tự nhiên'
    : pose === 'hands-on-hips' ? 'Đặt tay lên hông'
    : pose === 'arms-crossed' ? 'Khoanh tay'
    : 'Nghiêng người nhẹ';
  return `Phạm vi: ${rangeVi}; Tư thế: ${poseVi}. Mô tả cấu trúc: ảnh grayscale, độ tương phản cao, nhấn mạnh đường viền, tập trung hình dạng; bất biến góc quay; không yêu cầu nền.`;
}
