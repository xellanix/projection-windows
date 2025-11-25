import Build from "@/pages/build";
import Export from "@/pages/export";
import Extract from "@/pages/extract";
import Finish from "@/pages/finish";
import FinishExport from "@/pages/finish_export";
import Home from "@/pages/home";
import Import from "@/pages/import";
import Pack from "@/pages/pack";

export const pages = {
	"1": Home,
	"1.1": Import,
	"1.1.1": Extract,
	"1.1.1.1": Build,
	"1.1.1.1.1": Finish,
	"1.2": Export,
	"1.2.1": Pack,
	"1.2.1.1": FinishExport,
};

export type Page = keyof typeof pages;
