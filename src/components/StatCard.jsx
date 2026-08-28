const StatCard = ({ title, value, icon, subtext = '', color = 'green' }) => {
  return (
    <div className={`stat-card-item stat-card-${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-content">
        <span className="stat-card-title">{title}</span>
        <h3 className="stat-card-value">{value !== undefined && value !== null ? value.toLocaleString('en-IN') : '0'}</h3>
        {subtext && <span className="stat-card-subtext">{subtext}</span>}
      </div>
    </div>
  );
};

export default StatCard;
