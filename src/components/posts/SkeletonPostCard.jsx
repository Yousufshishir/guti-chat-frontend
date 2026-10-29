import React from 'react';

const SkeletonPostCard = () => {
  return (
    <div className="fb-card skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-avatar shimmer"></div>
        <div className="skeleton-text-group">
          <div className="skeleton-title shimmer"></div>
          <div className="skeleton-subtitle shimmer"></div>
        </div>
      </div>
      <div className="skeleton-content shimmer"></div>
      <div className="skeleton-content shimmer" style={{ width: '80%' }}></div>
      <div className="skeleton-footer">
        <div className="skeleton-btn shimmer"></div>
        <div className="skeleton-btn shimmer"></div>
        <div className="skeleton-btn shimmer"></div>
      </div>
    </div>
  );
};

export default SkeletonPostCard;