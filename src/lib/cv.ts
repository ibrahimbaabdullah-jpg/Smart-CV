import profile from "../../content/profile.json";
import experiences from "../../content/experiences.json";
import education from "../../content/education.json";
import skills from "../../content/skills.json";
import tools from "../../content/tools.json";
import projects from "../../content/projects.json";
import certificates from "../../content/certificates.json";
import volunteering from "../../content/volunteering.json";
import faq from "../../content/faq.json";

type Entry = Record<string, unknown> & { is_public?: boolean };

export { profile };

// Only entries the owner marked public ever reach the model.
const visible = (items: Entry[]) =>
  items
    .filter((item) => item.is_public !== false)
    .map((item) => {
      const rest = { ...item };
      delete rest.is_public;
      return rest;
    });

const sections: [string, Entry[]][] = [
  ["experiences", experiences],
  ["education", education],
  ["skills", skills],
  ["tools", tools],
  ["projects", projects],
  ["certificates", certificates],
  ["volunteering", volunteering],
  ["faq", faq],
];

export function cvAsText(): string {
  const parts = [`<profile>\n${JSON.stringify(profile, null, 2)}\n</profile>`];
  for (const [name, items] of sections) {
    parts.push(`<${name}>\n${JSON.stringify(visible(items), null, 2)}\n</${name}>`);
  }
  return parts.join("\n\n");
}
