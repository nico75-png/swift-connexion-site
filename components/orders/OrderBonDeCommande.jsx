const escapePdfText = (value) =>
  String(value ?? "-")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const buildContentLines = (order) => {
  const lines = [];
  lines.push(`Bon de commande #${order?.orderInfo?.number ?? "-"}`);
  lines.push("Document généré automatiquement par Swift Connexion");
  lines.push(" ");
  lines.push("1. Informations société");
  lines.push(`Nom de la société : ${order?.company?.name ?? "-"}`);
  lines.push(`Adresse : ${order?.company?.address ?? "-"}`);
  lines.push(`Secteur d'activité : ${order?.company?.industry ?? "-"}`);
  lines.push(`SIRET : ${order?.company?.siret ?? "-"}`);
  lines.push(`Téléphone : ${order?.company?.phone ?? "-"}`);
  lines.push(`E-mail : ${order?.company?.email ?? "-"}`);
  lines.push(" ");
  lines.push("2. Informations commande");
  lines.push(`Numéro : ${order?.orderInfo?.number ?? "-"}`);
  lines.push(`Date de création : ${order?.orderInfo?.createdAt ?? "-"}`);
  lines.push(`Livraison prévue : ${order?.orderInfo?.deliveryDate ?? "-"}`);
  lines.push(`Statut : ${order?.orderInfo?.status ?? "-"}`);
  lines.push(`Formule : ${order?.orderInfo?.plan ?? "-"}`);
  lines.push(" ");
  lines.push("3. Informations colis");
  lines.push(`Type : ${order?.parcel?.type ?? "-"}`);
  lines.push(`Descriptif : ${order?.parcel?.description ?? "-"}`);
  lines.push(`Poids (kg) : ${order?.parcel?.weight ?? "-"}`);
  lines.push(`Dimensions (cm) : ${order?.parcel?.dimensions ?? "-"}`);
  lines.push(" ");
  lines.push("4. Adresses");
  lines.push("Adresse d'enlèvement");
  lines.push(`  Nom : ${order?.pickupAddress?.name ?? "-"}`);
  lines.push(`  Adresse : ${order?.pickupAddress?.fullAddress ?? "-"}`);
  lines.push(`  Date & heure : ${order?.pickupAddress?.datetime ?? "-"}`);
  lines.push("Adresse de livraison");
  lines.push(`  Nom : ${order?.deliveryAddress?.name ?? "-"}`);
  lines.push(`  Adresse : ${order?.deliveryAddress?.fullAddress ?? "-"}`);
  lines.push(`  Date & heure : ${order?.deliveryAddress?.datetime ?? "-"}`);
  lines.push(" ");
  lines.push("5. Signature et mentions");
  lines.push(`Nom du chauffeur : ${order?.logistics?.driverName ?? "-"}`);
  lines.push(`Société de transport : ${order?.logistics?.carrier ?? "-"}`);
  lines.push("Signature client : __________________________");
  lines.push("Signature chauffeur : ________________________");
  lines.push(
    "Mention légale : Ce bon de commande confirme la prise en charge du colis selon les conditions du service.",
  );
  return lines;
};

const encodePdf = (lines) => {
  const header = "%PDF-1.4\n";
  let body = header;
  const offsets = [0];

  const addObject = (content) => {
    offsets.push(body.length);
    const index = offsets.length - 1;
    body += `${index} 0 obj\n${content}\nendobj\n`;
    return index;
  };

  const textLines = lines.map((line) => escapePdfText(line));
  let streamContent = "BT\n/F1 11 Tf\n1 0 0 1 48 800 Tm\n";
  textLines.forEach((line, idx) => {
    const shift = idx === 0 ? "" : "0 -18 Td\n";
    streamContent += `${shift}(${line}) Tj\n`;
  });
  streamContent += "ET";

  const streamObject = `<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream`;

  const fontIndex = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const streamIndex = addObject(streamObject);
  const pageIndex = addObject(
    `<< /Type /Page /Parent 4 0 R /MediaBox [0 0 595 842] /Contents ${streamIndex} 0 R /Resources << /Font << /F1 ${fontIndex} 0 R >> >> >>`,
  );
  const pagesIndex = addObject(`<< /Type /Pages /Kids [${pageIndex} 0 R] /Count 1 >>`);
  const catalogIndex = addObject(`<< /Type /Catalog /Pages ${pagesIndex} 0 R >>`);

  const xrefPosition = body.length;
  body += `xref\n0 ${offsets.length}\n`;
  body += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    const offset = String(offsets[i]).padStart(10, "0");
    body += `${offset} 00000 n \n`;
  }
  body += `trailer << /Size ${offsets.length} /Root ${catalogIndex} 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`;

  return body;
};

export const buildOrderPdfBlob = async (order) => {
  const lines = buildContentLines(order);
  const pdfString = encodePdf(lines);
  return new Blob([pdfString], { type: "application/pdf" });
};

const OrderBonDeCommande = ({ order }) => {
  const sections = [
    {
      title: "Informations société",
      fields: [
        { label: "Nom de la société", value: order?.company?.name ?? "-" },
        { label: "Adresse", value: order?.company?.address ?? "-" },
        { label: "Secteur d'activité", value: order?.company?.industry ?? "-" },
        { label: "SIRET", value: order?.company?.siret ?? "-" },
        { label: "Téléphone", value: order?.company?.phone ?? "-" },
        { label: "E-mail", value: order?.company?.email ?? "-" },
      ],
    },
    {
      title: "Informations commande",
      fields: [
        { label: "Numéro de commande", value: order?.orderInfo?.number ?? "-" },
        { label: "Date de création", value: order?.orderInfo?.createdAt ?? "-" },
        { label: "Livraison prévue", value: order?.orderInfo?.deliveryDate ?? "-" },
        { label: "Statut", value: order?.orderInfo?.status ?? "-" },
        { label: "Formule choisie", value: order?.orderInfo?.plan ?? "-" },
      ],
    },
    {
      title: "Informations colis",
      fields: [
        { label: "Type de colis", value: order?.parcel?.type ?? "-" },
        { label: "Descriptif", value: order?.parcel?.description ?? "-" },
        { label: "Poids (kg)", value: order?.parcel?.weight ?? "-" },
        { label: "Dimensions (cm)", value: order?.parcel?.dimensions ?? "-" },
      ],
    },
    {
      title: "Adresses",
      fields: [
        {
          label: "Adresse d'enlèvement",
          value: `${order?.pickupAddress?.name ?? "-"} — ${order?.pickupAddress?.fullAddress ?? "-"}`,
        },
        { label: "Date & heure d'enlèvement", value: order?.pickupAddress?.datetime ?? "-" },
        {
          label: "Adresse de livraison",
          value: `${order?.deliveryAddress?.name ?? "-"} — ${order?.deliveryAddress?.fullAddress ?? "-"}`,
        },
        { label: "Date & heure de livraison", value: order?.deliveryAddress?.datetime ?? "-" },
      ],
    },
    {
      title: "Signature et mentions",
      fields: [
        { label: "Nom du chauffeur", value: order?.logistics?.driverName ?? "-" },
        { label: "Société de transport", value: order?.logistics?.carrier ?? "-" },
        { label: "Mention légale", value: "Ce bon de commande confirme la prise en charge du colis selon les conditions du service." },
      ],
    },
  ];

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">
          Bon de commande #{order.orderInfo.number}
        </h2>
        <p className="text-sm text-slate-500">
          Aperçu web du document PDF généré au téléchargement
        </p>
      </header>
      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {section.title}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {section.fields.map((field) => (
                <div key={field.label} className="space-y-1 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {field.label}
                  </p>
                  <p className="text-sm text-slate-700">{field.value}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default OrderBonDeCommande;
