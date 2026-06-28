import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function PaginationControls({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="d-flex justify-content-center mt-3" aria-label="Paginacija">
      <ul className="pagination mb-0">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft className="me-2" />
            Prethodna
          </button>
        </li>

        {pages.map((page) => (
          <li
            className={`page-item ${page === currentPage ? "active" : ""}`}
            key={page}
          >
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          </li>
        ))}

        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            type="button"
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sledeća
            <FaChevronRight className="ms-2" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default PaginationControls;
