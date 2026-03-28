// src/components/Pagination.jsx
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Build page list with smart ellipsis
  const delta = 2;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (
      i === currentPage - delta - 1 ||
      i === currentPage + delta + 1
    ) {
      pages.push('...');
    }
  }

  // Deduplicate consecutive dots
  const deduped = pages.filter((p, i) => !(p === '...' && pages[i - 1] === '...'));

  return (
    <div className="pagination-wrap" role="navigation" aria-label="Pagination">
      <button
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <i className="bi bi-chevron-left"></i>
      </button>

      {deduped.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="page-dots" aria-hidden="true">…</span>
        ) : (
          <button
            key={p}
            className={`page-btn ${p === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className="page-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
}