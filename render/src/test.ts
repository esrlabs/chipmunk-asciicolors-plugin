import { default as AnsiUp } from 'ansi_up';

let ansiup = new AnsiUp();
ansiup.escape_for_html = false;


console.log(ansiup.ansi_to_html('_[0m_').length);

console.log(ansiup.ansi_to_html('[31;5;40mINJECT'));
ansiup = new AnsiUp();
ansiup.escape_for_html = false;

console.log(ansiup.ansi_to_html('[31;5;40mINJECT[0m'));
ansiup = new AnsiUp();
ansiup.escape_for_html = false;

console.log(ansiup.ansi_to_html('INJECT[0m'));
ansiup = new AnsiUp();
ansiup.escape_for_html = false;

console.log(ansiup.ansi_to_html('[0mINJECT'));
ansiup = new AnsiUp();
ansiup.escape_for_html = false;

console.log(ansiup.ansi_to_html('[0m_').length);

