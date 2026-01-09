-- CreateTable
CREATE TABLE "projects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "icon" TEXT,
    "year" INTEGER NOT NULL,
    "leftTitle_en" TEXT NOT NULL,
    "leftTitle_tr" TEXT NOT NULL,
    "leftTitle_ar" TEXT,
    "description_en" TEXT NOT NULL,
    "description_tr" TEXT NOT NULL,
    "description_ar" TEXT,
    "location_en" TEXT NOT NULL,
    "location_tr" TEXT NOT NULL,
    "location_ar" TEXT,
    "client_en" TEXT NOT NULL,
    "client_tr" TEXT NOT NULL,
    "client_ar" TEXT,
    "typology_en" TEXT NOT NULL,
    "typology_tr" TEXT NOT NULL,
    "typology_ar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "project_details" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "content_tr" TEXT,
    "content_en" TEXT,
    "content_ar" TEXT,
    "title_en" TEXT,
    "title_tr" TEXT,
    "title_ar" TEXT,
    "projectId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_details_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
