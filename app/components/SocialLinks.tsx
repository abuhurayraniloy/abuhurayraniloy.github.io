function GitHubIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.73.084-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.624-5.475 5.921.43.372.815 1.103.815 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.696.825.577C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>;
}

function LinkedInIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5.2 3.5a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 0 1 4.4 0ZM1.1 8h4.2v13H1.1V8Zm6.8 0h4v1.78h.06c.56-1.06 1.92-2.18 3.96-2.18 4.24 0 5.03 2.79 5.03 6.42V21h-4.17v-6.2c0-1.48-.03-3.39-2.07-3.39-2.07 0-2.39 1.62-2.39 3.29V21H7.9V8Z" /></svg>;
}

export function SocialLinks({ github, linkedin }: { github: string; linkedin: string }) {
  return <div aria-label="Social links" className="social-links">
    <a aria-label="GitHub" href={github} rel="noreferrer" target="_blank" title="GitHub"><GitHubIcon /></a>
    <a aria-label="LinkedIn" href={linkedin} rel="noreferrer" target="_blank" title="LinkedIn"><LinkedInIcon /></a>
  </div>;
}
