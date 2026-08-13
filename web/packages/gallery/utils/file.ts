import type { EnteFile } from "ente-media/file";
import { fileCreationPhotoSortTime, fileFileName } from "ente-media/file-metadata";

export type DesktopFileSortOrder =
    | "date-desc"
    | "date-asc"
    | "filename-asc"
    | "filename-desc";

const desktopFileSortOrder = (): DesktopFileSortOrder | undefined => {
    if (typeof window === "undefined" || !("electron" in globalThis)) {
        return undefined;
    }
    const value = window.localStorage.getItem("enteDesktopFileSortOrder");
    return value === "date-asc" ||
        value === "filename-asc" ||
        value === "filename-desc" ||
        value === "date-desc"
        ? value
        : undefined;
};

export const sortFiles = (files: EnteFile[], sortAsc = false) => {
    const desktopOrder = desktopFileSortOrder();
    if (desktopOrder === "filename-asc" || desktopOrder === "filename-desc") {
        const collator = new Intl.Collator(undefined, {
            numeric: true,
            sensitivity: "base",
        });
        const factor = desktopOrder === "filename-asc" ? 1 : -1;
        return files.sort(
            (a, b) => factor * collator.compare(fileFileName(a), fileFileName(b)),
        );
    }

    // Break equal displayed creation dates by modification time.
    const factor = sortAsc ? -1 : 1;
    const sortTimeByFile = new Map<EnteFile, number>();
    const sortTimeForFile = (file: EnteFile) => {
        const cached = sortTimeByFile.get(file);
        if (cached != undefined) return cached;
        const t = fileCreationPhotoSortTime(file);
        sortTimeByFile.set(file, t);
        return t;
    };
    return files.sort((a, b) => {
        const at = sortTimeForFile(a);
        const bt = sortTimeForFile(b);
        return at == bt
            ? factor *
                  (b.metadata.modificationTime - a.metadata.modificationTime)
            : factor * (bt - at);
    });
};

// A file can appear once per collection with the same global file ID.
// Keep the first entry; sorting before this chooses which membership survives.
export const uniqueFilesByID = (files: EnteFile[]) => {
    const seen = new Set<number>();
    return files.filter(({ id }) => {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

export const groupFilesByCollectionID = (files: EnteFile[]) =>
    files.reduce((result, file) => {
        const id = file.collectionID;
        let cfs = result.get(id);
        if (!cfs) result.set(id, (cfs = []));
        cfs.push(file);
        return result;
    }, new Map<number, EnteFile[]>());
