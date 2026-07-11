import { PrismaClient, MemberCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const members: Array<{
  companyName: string;
  category: MemberCategory;
  contact: string;
  street: string;
  city?: string;
  logo: string;
}> = [
  { companyName: "Linden-Apotheke", category: "FREIE_BERUFE", contact: "Katharina & Gunnar Geßner", street: "Bäderstr. 12", logo: "linden-apotheke" },
  { companyName: "Fisch-Meier", category: "HANDEL", contact: "Torsten & Tobias Meier", street: "Daimlerstr. 8", logo: "fisch-meier" },
  { companyName: "Hoch2 Finanz", category: "DIENSTLEISTUNG", contact: "Nico & John-Peter Bohnsack", street: "Eutiner Str. 5", logo: "hoch2-finanz" },
  { companyName: "Hoch2 Immo", category: "DIENSTLEISTUNG", contact: "Nico & John-Peter Bohnsack", street: "Eutiner Str. 5", logo: "hoch2-immo" },
  { companyName: "Roden Landtechnik", category: "HANDEL", contact: "Hauke Heinrich", street: "Lübecker Str. 20", logo: "roden-landtechnik" },
  { companyName: "Sanitär-Heizung Burmeister", category: "HANDWERK", contact: "Martin Burmeister", street: "Bredenfeldstr. 2b", logo: "sanitaer-heizung-burmeister" },
  { companyName: "Chrome Diner", category: "GASTRONOMIE", contact: "Jörg Plath", street: "Dieselstr. 1a", logo: "chrome-diner" },
  { companyName: "Maschinenring Wagrien (MR)", category: "DIENSTLEISTUNG", contact: "Bärbel Rhode", street: "Dr.-Julius-Stinde-Str. 4", logo: "mr-wagrien" },
  { companyName: "Landgraf Logistics", category: "DIENSTLEISTUNG", contact: "Ole Landgraf", street: "Lübecker Str. 107", logo: "logistic-landgraf" },
  { companyName: "Auto Schömig (Subaru / BAIC)", category: "HANDEL", contact: "André & Freya Schömig", street: "Zum Windpark 3", logo: "subaru-lensahn" },
  { companyName: "Baufinanz SH", category: "DIENSTLEISTUNG", contact: "Christoffer Köhler", street: "Eutiner Str. 41a", logo: "baufinanz-sh" },
  { companyName: "Provinzial Lensahn", category: "DIENSTLEISTUNG", contact: "Klaus Behrens", street: "Eutiner Str. 4", logo: "provinzial-lensahn" },
  { companyName: "GST Rimm (Grimm Straßenbau)", category: "HANDWERK", contact: "Jan Grimm", street: "Porschestr. 2", logo: "grimm-strassenbau" },
  { companyName: "FHS Schaardt", category: "DIENSTLEISTUNG", contact: "Ulrich & Britta Schaardt", street: "Lütjenburger Str. 14a", logo: "fhs-schaardt" },
  { companyName: "DJ Neddy", category: "DIENSTLEISTUNG", contact: "Ralph & Maren Neddermeyer", street: "Zum Klützenberg 2", logo: "dj-neddy" },
  { companyName: "Wagrien-Apotheke", category: "FREIE_BERUFE", contact: "Dörte Rehmert", street: "Eutiner Str. 8-10", logo: "wagrien-apotheke" },
  { companyName: "Frau Aktiv", category: "DIENSTLEISTUNG", contact: "Cindy Schmidt", street: "Bäderstr. 9-11", logo: "frau-aktiv" },
  { companyName: "Lena Wignanek Fotografie", category: "FREIE_BERUFE", contact: "Lena Wignanek", street: "Op de Wurth 11", city: "Damlos", logo: "lena-wignanek" },
  { companyName: "Codan Companies", category: "DIENSTLEISTUNG", contact: "André Feller", street: "Stig Husted Andersen Str. 11", logo: "codan-companies" },
  { companyName: "Thor Training", category: "DIENSTLEISTUNG", contact: "Thore Hülsen", street: "Lübecker Str. 105", logo: "thor-training" },
  { companyName: "Steuerkanzlei Schöning", category: "FREIE_BERUFE", contact: "Sönke Schöning", street: "Hohenkrogstr. 1-3", logo: "steuerberater-lensahn" },
  { companyName: "Zimmerei & Holzbau Sven Osten", category: "HANDWERK", contact: "Sven Osten", street: "Lensahn", logo: "zimmerei-holzbau-sven-osten" },
  { companyName: "Gut Petersdorf", category: "DIENSTLEISTUNG", contact: "Friedrich & Friederike von Ludowig", street: "Petersdorfer Allee 1", logo: "gut-petersdorf" },
  { companyName: "Balkan-Restaurant bei Jovo", category: "GASTRONOMIE", contact: "Jovo", street: "Lensahn", logo: "balkan-restaurant" },
  { companyName: "Ostsee Camping Partner", category: "DIENSTLEISTUNG", contact: "Marcel & Dirk Ruhe", street: "Zum Windpark 10", logo: "ostsee-camping-partner" },
  { companyName: "HaGaLa Natursteinhandel", category: "HANDEL", contact: "Jan-Peter Hansen", street: "Prienfeldstr. 23", logo: "natursteinhandel-lensahn" },
  { companyName: "Tischlerei Stefan Rüsch", category: "HANDWERK", contact: "Stefan Rüsch", street: "Lübecker Str. 55", logo: "tischlerei-ruesch" },
  { companyName: "Palast Döner Lensahn", category: "GASTRONOMIE", contact: "Omar Amine", street: "Bäderstr. 2A", logo: "palast-doener" },
  { companyName: "Museumshof Lensahn", category: "DIENSTLEISTUNG", contact: "Eckhard Schulte-Kersmecke", street: "Bäderstr. 18", logo: "museumshof-lensahn" },
];

const boardMembers = [
  { name: "Christian Popp", position: "1. Vorsitzender", email: "vorstand@gewerbeverein-lensahn.de", phone: "0174 / 165 98 48", sortOrder: 0 },
  { name: "Tobias Meier", position: "2. Vorsitzender", email: "vorstand@gewerbeverein-lensahn.de", phone: "0172 / 46 27 317", sortOrder: 1 },
  { name: "Nico Bohnsack", position: "Kassenwart", email: "vorstand@gewerbeverein-lensahn.de", sortOrder: 2 },
  { name: "Hauke Heinrich", position: "1. Beisitzer", email: "vorstand@gewerbeverein-lensahn.de", sortOrder: 3 },
  { name: "Gunnar Geßner", position: "2. Beisitzer", email: "vorstand@gewerbeverein-lensahn.de", sortOrder: 4 },
  { name: "Torsten Meier", position: "3. Beisitzer", email: "vorstand@gewerbeverein-lensahn.de", sortOrder: 5 },
];

const events = [
  {
    title: "Gewerbefest 2026",
    description:
      "Aus Lensahn – Für Lensahn: Unternehmen, Vereine und Besucher kommen zusammen. Mit vielfaltigem Programm, Kinderaktionen, regionalen Angeboten und einer Spendenaktion. Eintritt: 1 Euro fuer Erwachsene, Kinder frei.",
    location: "Museumshof Lensahn",
    startAt: new Date("2026-07-12T10:00:00+02:00"),
    endAt: new Date("2026-07-12T18:00:00+02:00"),
    imageUrl: "/legacy-photos/event-photo-1.png",
  },
  {
    title: "UpDate! Unternehmerakademie – Mitarbeiterbindung ist kein Zufall",
    description:
      "Vortrag und Austausch rund um moderne Ansaetze zur Mitarbeitergewinnung und -bindung. Kostenlos fuer Mitglieder, 15 Euro fuer Nichtmitglieder. Anmeldung erforderlich.",
    location: "HOCH2FINANZ, Eutiner Str. 5, 23738 Lensahn",
    startAt: new Date("2026-02-25T19:30:00+01:00"),
    endAt: new Date("2026-02-25T21:00:00+01:00"),
    imageUrl: "/legacy-photos/event-photo-2.png",
  },
  {
    title: "Lensahn.Connect – Blick hinter die Kulissen",
    description:
      "Exklusive Einblicke in Betrieb und Branche bei Roden Landtechnik. Freier Eintritt, keine Anmeldung noetig.",
    location: "Roden Landtechnik, Lübecker Str. 20, 23738 Lensahn",
    startAt: new Date("2026-03-18T19:30:00+01:00"),
    imageUrl: "/legacy-photos/event-photo-3.png",
  },
  {
    title: "Meet & Greet des Gewerbevereins",
    description:
      "Info-Veranstaltung des neu gegruendeten Vereins: gesellig zusammenkommen, neue Kontakte knuepfen und ueber den Verein sprechen.",
    location: "Roden Landtechnik, Lübecker Str. 20, 23738 Lensahn",
    startAt: new Date("2025-09-17T19:00:00+02:00"),
    endAt: new Date("2025-09-17T21:00:00+02:00"),
    imageUrl: "/legacy-photos/event-photo-4.png",
  },
  {
    title: "Sommerfest 2025",
    description:
      "Das gruendende Sommerfest der Lensahner Gewerbetreibenden im Gewerbegebiet - der offizielle Auftakt des neu gegruendeten Gewerbeverein Lensahn e.V.",
    location: "REWE-Parkplatz, Lensahn",
    startAt: new Date("2025-07-12T10:00:00+02:00"),
    endAt: new Date("2025-07-12T18:00:00+02:00"),
    imageUrl: "/legacy-photos/event-photo-1.png",
  },
];

async function main() {
  const adminPassword = await bcrypt.hash("ChangeMe123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@gewerbeverein-lensahn.de" },
    update: {},
    create: {
      email: "admin@gewerbeverein-lensahn.de",
      passwordHash: adminPassword,
      name: "Administrator",
      role: "ADMIN",
    },
  });

  await prisma.member.deleteMany({});

  for (const member of members) {
    const slug = slugify(member.companyName);
    await prisma.member.upsert({
      where: { slug },
      update: {
        logoUrl: `/legacy-photos/member-${member.logo}.png`,
      },
      create: {
        companyName: member.companyName,
        slug,
        category: member.category,
        street: member.street,
        city: member.city ?? "Lensahn",
        zip: "23738",
        description: `${member.contact} · ${member.street}, ${member.city ?? "23738 Lensahn"}`,
        logoUrl: `/legacy-photos/member-${member.logo}.png`,
        status: "ACTIVE",
      },
    });
  }

  await prisma.boardMember.deleteMany({});
  await prisma.boardMember.createMany({ data: boardMembers });

  for (const event of events) {
    const slug = slugify(event.title);
    await prisma.event.upsert({
      where: { slug },
      update: { imageUrl: event.imageUrl },
      create: { ...event, slug },
    });
  }

  console.log("Seed abgeschlossen. Admin-Login: admin@gewerbeverein-lensahn.de / ChangeMe123!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
