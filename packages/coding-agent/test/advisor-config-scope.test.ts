import { afterEach, describe, expect, it } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { TempDir } from "@oh-my-pi/pi-utils";
import { initialAdvisorConfigScope } from "../src/advisor/config";

describe("initialAdvisorConfigScope", () => {
	const temps: TempDir[] = [];
	afterEach(async () => {
		for (const t of temps.splice(0)) await t.remove();
	});
	function dirs() {
		const projectDir = TempDir.createSync("@advisor-scope-project-");
		const agentDir = TempDir.createSync("@advisor-scope-agent-");
		temps.push(projectDir, agentDir);
		return { projectDir: projectDir.path(), agentDir: agentDir.path() };
	}

	it("opens the user roster when the project has none", async () => {
		const d = dirs();
		fs.writeFileSync(path.join(d.agentDir, "WATCHDOG.yml"), "advisors:\n  - name: Reviewer\n");
		expect(await initialAdvisorConfigScope(d)).toBe("user");
	});

	it("opens the project roster when one exists", async () => {
		const d = dirs();
		fs.writeFileSync(path.join(d.agentDir, "WATCHDOG.yml"), "advisors:\n  - name: Reviewer\n");
		fs.writeFileSync(path.join(d.projectDir, "WATCHDOG.yaml"), "advisors:\n  - name: Mine\n");
		expect(await initialAdvisorConfigScope(d)).toBe("project");
	});

	it("starts a new roster at project scope when neither exists", async () => {
		expect(await initialAdvisorConfigScope(dirs())).toBe("project");
	});
});
