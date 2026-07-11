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
}> = [
  { companyName: "Linden-Apotheke", category: "FREIE_BERUFE", contact: "Katharina & Gunnar Geßner", street: "Bäderstr. 12" },
  { companyName: "Fisch Meier", category: "HANDEL", contact: "Torsten & Tobias Meier", street: "Daimlerstr. 8" },
  { companyName: "Hoch2 Finanz", category: "DIENSTLEISTUNG", contact: "Nico & John-Peter Bohnsack", street: "Eutiner Str. 5" },
  { companyName: "Rohden Landtechnik", category: "HANDEL", contact: "Hauke Heinrich", street: "Lübecker Str. 20" },
  { companyName: "Sanitär-Heizung Burmeister", category: "HANDWERK", contact: "Martin Burmeister", street: "Bredenfeldstr. 2b" },
  { companyName: "Chrome Diner", category: "GASTRONOMIE", contact: "Jörg Plath", street: "Dieselstr. 1a" },
  { companyName: "MR Wagrien", category: "DIENSTLEISTUNG", contact: "Bärbel Rhode", street: "Dr.-Julius-Stinde-Str. 4" },
  { companyName: "Logistic Landgraf", category: "DIENSTLEISTUNG", contact: "Ole Landgraf", street: "Lübecker Str. 107" },
  { companyName: "Subaru Lensahn", category: "HANDEL", contact: "André & Freya Schömig", street: "Zum Windpark 3" },
  { companyName: "Baufinanz SH", category: "DIENSTLEISTUNG", contact: "Christoffer Köhler", street: "Eutiner Str. 41a" },
  { companyName: "Provinzial Lensahn", category: "DIENSTLEISTUNG", contact: "Klaus Behrens", street: "Eutiner Str. 4" },
  { companyName: "Grimm Straßenbau", category: "HANDWERK", contact: "Jan Grimm", street: "Porschestr. 2" },
  { companyName: "FHS Schaardt", category: "DIENSTLEISTUNG", contact: "Ulrich & Britta Schaardt", street: "Lütjenburger Str. 14a" },
  { companyName: "DJ Neddy", category: "DIENSTLEISTUNG", contact: "Ralph & Maren Neddermeyer", street: "Zum Klützenberg 2" },
  { companyName: "Wagrien-Apotheke", category: "FREIE_BERUFE", contact: "Dörte Rehmert", street: "Eutiner Str. 8-10" },
  { companyName: "Frau Aktiv", category: "DIENSTLEISTUNG", contact: "Cindy Schmidt", street: "Bäderstr. 9-11" },
  { companyName: "Lena Wignanek", category: "FREIE_BERUFE", contact: "Lena Wignanek", street: "Op de Wurth 11", city: "Damlos" },
  { companyName: "Codan Companies", category: "DIENSTLEISTUNG", contact: "André Feller", street: "Stig Husted Andersen Str. 11" },
  { companyName: "Thor Training", category: "DIENSTLEISTUNG", contact: "Thore Hülsen", street: "Lübecker Str. 105" },
  { companyName: "Steuerberater Lensahn", category: "FREIE_BERUFE", contact: "Sönke Schöning", street: "Hohenkrogstr. 1-3" },
  { companyName: "Gut Petersdorf", category: "DIENSTLEISTUNG", contact: "Friedrich & Friederike von Ludowig", street: "Petersdorfer Allee 1" },
  { companyName: "Ostsee Camping Partner", category: "DIENSTLEISTUNG", contact: "Marcel & Dirk Ruhe", street: "Zum Windpark 10" },
  { companyName: "Museumshof Lensahn", category: "DIENSTLEISTUNG", contact: "Eckhard Schulte-Kersmecke", street: "Bäderstr. 18" },
  { companyName: "Natursteinhandel Lensahn", category: "HANDEL", contact: "Jan-Peter Hansen", street: "Prienfeldstr. 23" },
  { companyName: "Tischlerei Ruesch", category: "HANDWERK", contact: "Stefan Rüsch", street: "Lübecker Str. 55" },
  { companyName: "Palast Döner", category: "GASTRONOMIE", contact: "Omar Amine", street: "Bäderstr. 2A" },
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
  },
  {
    title: "UpDate! Unternehmerakademie – Mitarbeiterbindung ist kein Zufall",
    description:
      "Vortrag und Austausch rund um moderne Ansaetze zur Mitarbeitergewinnung und -bindung. Kostenlos fuer Mitglieder, 15 Euro fuer Nichtmitglieder. Anmeldung erforderlich.",
    location: "HOCH2FINANZ, Eutiner Str. 5, 23738 Lensahn",
    startAt: new Date("2026-02-25T19:30:00+01:00"),
    endAt: new Date("2026-02-25T21:00:00+01:00"),
  },
  {
    title: "Lensahn.Connect – Blick hinter die Kulissen",
    description:
      "Exklusive Einblicke in Betrieb und Branche bei Rohden Landtechnik. Freier Eintritt, keine Anmeldung noetig.",
    location: "Rohden Landtechnik, Lübecker Str. 20, 23738 Lensahn",
    startAt: new Date("2026-03-18T19:30:00+01:00"),
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

  for (const member of members) {
    const slug = slugify(member.companyName);
    await prisma.member.upsert({
      where: { slug },
      update: {},
      create: {
        companyName: member.companyName,
        slug,
        category: member.category,
        street: member.street,
        city: member.city ?? "Lensahn",
        zip: "23738",
        description: `${member.contact} · ${member.street}, ${member.city ?? "23738 Lensahn"}`,
        status: "ACTIVE",
      },
    });
  }

  await prisma.boardMember.createMany({ data: boardMembers, skipDuplicates: true });

  for (const event of events) {
    const slug = slugify(event.title);
    await prisma.event.upsert({
      where: { slug },
      update: {},
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
