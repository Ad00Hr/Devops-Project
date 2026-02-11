import { useQuery } from "@tanstack/react-query";
import { getResults } from "../api";

export default function Results({ pollId }) {
  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["results", pollId],
    queryFn: () => getResults(pollId),
  });

  if (isLoading) return <p style={{ textAlign: "center", color: "#999" }}> Chargement des résultats...</p>;
  if (error) return <p style={{ color: "var(--error-color)" }}> Erreur: {error.message}</p>;

  const options = results?.options || [];
  const pollResults = results?.results || {};

  // Calculate total votes
  const totalVotes = Object.values(pollResults).reduce((sum, count) => sum + count, 0);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}> Résultats du sondage</h3>
      <p style={styles.question}>{results?.question}</p>

      <div style={styles.resultsGrid}>
        {options.map((option) => {
          const count = pollResults[option.id] || 0;
          const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

          return (
            <div key={option.id} style={styles.optionCard}>
              <div style={styles.optionHeader}>
                <span style={styles.optionText}>{option.text}</span>
                <span style={styles.voteCount}>{count} vote{count !== 1 ? "s" : ""}</span>
              </div>

              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${percentage}%`,
                  }}
                />
              </div>

              <p style={styles.percentage}>
                {percentage}% ({count}/{totalVotes})
              </p>
            </div>
          );
        })}
      </div>

      <div style={styles.summary}>
        <p> Total des votes: <strong>{totalVotes}</strong></p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    marginTop: "20px",
  },
  title: {
    color: "var(--primary)",
    marginBottom: "10px",
    fontSize: "1.3rem",
  },
  question: {
    color: "#ccc",
    marginBottom: "20px",
    fontSize: "1rem",
    fontStyle: "italic",
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "15px",
    marginBottom: "20px",
  },
  optionCard: {
    padding: "15px",
    background: "rgba(30, 30, 46, 0.8)",
    borderRadius: "8px",
    border: "1px solid rgba(99, 102, 241, 0.15)",
  },
  optionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  optionText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: "1rem",
  },
  voteCount: {
    color: "var(--primary)",
    fontWeight: "600",
    fontSize: "0.9rem",
    background: "rgba(99, 102, 241, 0.15)",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  progressBar: {
    width: "100%",
    height: "24px",
    background: "rgba(0, 0, 0, 0.3)",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "8px",
    border: "1px solid rgba(99, 102, 241, 0.1)",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, var(--primary), var(--secondary))",
    transition: "width 0.4s ease",
  },
  percentage: {
    color: "#999",
    fontSize: "0.85rem",
    margin: "0",
    textAlign: "right",
  },
  summary: {
    paddingTop: "15px",
    borderTop: "1px solid rgba(99, 102, 241, 0.15)",
    textAlign: "center",
    color: "#ccc",
  },
};
