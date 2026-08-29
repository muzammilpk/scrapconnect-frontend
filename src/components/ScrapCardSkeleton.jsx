function ScrapCardSkeleton() {
  return (
    <div className="scrap-card skeleton-card" style={{ opacity: 0.7, pointerEvents: 'none' }}>
      <div className="scrap-image-container" style={{ background: '#E2E8F0', height: '180px' }}></div>
      <div className="scrap-card-content" style={{ padding: '1rem' }}>
        <div style={{ height: '18px', background: '#E2E8F0', borderRadius: '4px', marginBottom: '8px', width: '70%' }}></div>
        <div style={{ height: '14px', background: '#F1F5F9', borderRadius: '4px', marginBottom: '12px', width: '40%' }}></div>
        <div style={{ height: '14px', background: '#F1F5F9', borderRadius: '4px', marginBottom: '12px', width: '90%' }}></div>
        <div style={{ height: '36px', background: '#E2E8F0', borderRadius: '6px', width: '100%', marginTop: '12px' }}></div>
      </div>
    </div>
  );
}

export default ScrapCardSkeleton;
