const API_KEY = "Gy38t2FYDvn68mSZAN0k1dU68qQJRmvu5sOeQjGDNcpZHewaxn6iRbLntDJn";
const BASE_URL = "https://zenodo.org/api/records";

export const getPopularNotes = async () => {
  const response = await fetch(
    `${BASE_URL}?access_token=${API_KEY}&sort=mostviewed`
  );
  const data = await response.json();
  return (data.hits?.hits || []).map((hit) => {
    const pdfFile =
      hit.files?.find(
        (f) =>
          f.type === "pdf" ||
          f.key?.toLowerCase().endsWith(".pdf") ||
          f.filename?.toLowerCase().endsWith(".pdf")
      ) || hit.files?.[0];

    return {
      id: hit.id,
      title: hit.metadata?.title,
      upload_date: hit.metadata?.publication_date,
      language: hit.metadata?.language,
      pdfUrl: pdfFile?.links?.self || pdfFile?.links?.download,
    };
  });
};

export const searchNotes = async (query) => {
  const response = await fetch(
    `${BASE_URL}?access_token=${API_KEY}&q=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.hits.hits;
};
