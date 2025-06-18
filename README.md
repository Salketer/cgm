# GitHubBrowser

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.2.

The GitHubBrowser application allows users to search for GitHub repositories and view their commits. It utilizes the GitHub API (through its official SDK 'octokit') to fetch repository data and display it in a user-friendly interface. The API can be accessed without authentication for public repositories, but for private repositories or higher rate limits, you may need to set up a personal access token in the file `src/app/core/providers/Octokit.ts`.

Since the Github API can be slow and provide a lot of data, the application makes use of a custom DataSource to handle pagination and data management efficiently.

The UI has been designed with responsiveness in mind, ensuring a good user experience across different devices. The application is built using Material Design components, which provide a modern and consistent look and feel while providing the fast development experience required for this particular project.

The application is also completely tooled to be internationalized (i18n) and currently supports Engmish and French languages. The i18n files are located in the `src/locale` directory, more languages can be added as needed. When adding a new language, ensure to update the `angular.json` file to include the new locale at `projects.GitHub-Browser.i18n.locales`.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
