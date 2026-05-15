import cac from "cac";
import inquirer from "inquirer";
import createPost from "./create-post.ts";

const cli = cac();

cli.command("post", "create a new post").action(async () => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Title?",
    },
  ]);

  const outputPath = await createPost(answers.title);
  console.log(`Created ${outputPath}`);
});

cli.parse();
