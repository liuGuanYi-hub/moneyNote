const SkeletonLine = ({ width = '100%', style }) => (
  <div className={`skeleton skeleton-line${width !== '100%' ? ' ' + width : ''}`} style={style} />
);

const SkeletonCard = ({ style }) => (
  <div className="skeleton skeleton-card" style={style} />
);

const SkeletonCircle = ({ size = 40, style }) => (
  <div className="skeleton skeleton-circle" style={{ width: size, height: size, ...style }} />
);

const SkeletonRecordRow = () => (
  <div className="skeleton-row">
    <SkeletonCircle />
    <div style={{ flex: 1 }}>
      <SkeletonLine width="w60" />
      <SkeletonLine width="w40" style={{ marginBottom: 0 }} />
    </div>
    <SkeletonLine width="w40" style={{ width: '50px' }} />
  </div>
);

const SkeletonStatCard = () => (
  <div className="card" style={{ textAlign: 'center' }}>
    <div className="skeleton skeleton-line w60" style={{ margin: '0 auto 12px' }} />
    <div className="skeleton skeleton-line w40" style={{ margin: '0 auto', height: '24px', width: '80px' }} />
  </div>
);

const SkeletonChart = ({ height = 260 }) => (
  <div className="card">
    <div className="skeleton skeleton-line w60" style={{ marginBottom: 16 }} />
    <div className="skeleton" style={{ height, width: '100%', borderRadius: 8 }} />
  </div>
);

export { SkeletonLine, SkeletonCard, SkeletonCircle, SkeletonRecordRow, SkeletonStatCard, SkeletonChart };
export default SkeletonRecordRow;
