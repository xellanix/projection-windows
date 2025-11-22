import Build from "@/pages/build";
import Export from "@/pages/export";
import Extract from "@/pages/extract";
import Finish from "@/pages/finish";
import Home from "@/pages/home";
import Import from "@/pages/import";

export const pages = {
	"1": Home,
	"1.1": Import,
	"1.1.1": Extract,
	"1.1.1.1": Build,
	"1.1.1.1.1": Finish,
	"1.2": Export,
};

export type Page = keyof typeof pages;
