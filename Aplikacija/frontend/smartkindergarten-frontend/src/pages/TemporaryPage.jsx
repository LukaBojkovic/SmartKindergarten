function TemporaryPage({ title, description }) {
  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h1>{title}</h1>
          <p className="text-muted">{description}</p>
          <div className="alert alert-info mb-0">
            Frontend za ovu funkcionalnost nije jos uvek dodat.
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemporaryPage;