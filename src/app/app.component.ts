import { Component, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  showSilences = false;
  puntillo: boolean = false;

  selectedNote: string | null = null;
  selectedFigure: string | null = null;
  alteration: string = '';
  notasAnotadas: string[] = [];
  textoNotas: string = '';
  compasSeleccionado: string = '4/4';
  armaduraSeleccionada: string = '1'; // Sol Mayor (1 sostenido)
  divisiones: number = 1;
  claveSeleccionada: string = 'G'; // Clave de sol por defecto

  notasDisponibles: string[] = [
    'DO',
    'RE',
    'MI',
    'FA',
    'SOL',
    'LA',
    'SI',
    'DOA',
    'REA',
    'MIA',
  ];
  figuras: string[] = [
    'REDONDA',
    'BLANCA',
    'NEGRA',
    'CORCHEA',
    'SEMICORCHEA',
    'FUSA',
    'SEMIFUSA',
  ];

  ngAfterViewInit() {
    this.initializeTooltips();
  }

  initializeTooltips() {
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
  }

  selectTab(silenceMode: boolean) {
    this.showSilences = silenceMode;
    this.selectedFigure = null;
    this.initializeTooltips();
  }

  selectNote(nota: string) {
    this.selectedNote = this.selectedNote === nota ? null : nota;
  }

  selectFigure(figura: string) {
    this.selectedFigure = this.selectedFigure === figura ? null : figura;

    if (this.selectedFigure?.includes('(silencio)')) {
      this.selectedNote = null;
    }
  }

  selectAlteration(tipo: string) {
    this.alteration = this.alteration === tipo ? '' : tipo;
  }

  canAddNote(): boolean {
    return (
      this.selectedFigure !== null &&
      (this.selectedFigure.includes('(silencio)') || this.selectedNote !== null)
    );
  }

  addNote() {
    if (!this.canAddNote()) return;

    const notaText = this.selectedFigure?.includes('(silencio)')
      ? `${this.selectedFigure}`
      : `${this.selectedNote}${this.alteration} - ${this.selectedFigure}`;

    const texto = notaText + (this.puntillo ? ' con puntillo' : '');

    this.notasAnotadas.push(texto);
    this.textoNotas = this.notasAnotadas.join(', ');

    this.selectedNote = null;
    this.selectedFigure = null;
    this.alteration = '';
    this.puntillo = false;
  }

  limpiarNotas() {
    this.notasAnotadas = [];
    this.textoNotas = '';
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    const activeElement = document.activeElement;
    const isTextAreaFocused = activeElement instanceof HTMLTextAreaElement;

    if (isTextAreaFocused) {
      return; // Salir si el cursor está dentro del textarea
    }
    const key = event.key.toLowerCase();

    // Notas
    if (this.keyToNoteMap[key]) {
      this.selectNote(this.keyToNoteMap[key]);
      event.preventDefault();
      return;
    }

    // Figuras
    if (this.keyToFigureMap[key]) {
      const figura = this.keyToFigureMap[key];
      const figuraFinal = this.showSilences ? `${figura} (silencio)` : figura;
      this.selectFigure(figuraFinal);
      event.preventDefault();
      return;
    }

    // Alteraciones
    if (['1', '2', '3'].includes(key)) {
      this.handleAlterationKey(key);
      event.preventDefault();
      return;
    }

    // Puntillo
    if (key === '.') {
      this.handlePuntilloKey(key);
      event.preventDefault();
      return;
    }

    // Agregar nota
    if (event.key === 'Enter') {
      this.handleAddNoteKey(event);
      event.preventDefault();
      return;
    }

    // Cambiar entre Figuras y Silencios
    if (key === 'tab') {
      this.handleToggleSilenceTabKey(key);
      event.preventDefault();
    }
  }
  private keyToNoteMap: { [key: string]: string } = {
    e: 'SI',
    w: 'LA',
    q: 'SOL',
    u: 'FA',
    i: 'MI',
    o: 'RE',
    p: 'DO',
    r: 'DOA',
    t: 'REA',
    y: 'MIA',
  };

  private keyToFigureMap: { [key: string]: string } = {
    z: 'REDONDA',
    x: 'BLANCA',
    c: 'NEGRA',
    v: 'CORCHEA',
    b: 'SEMICORCHEA',
    n: 'FUSA',
    m: 'SEMIFUSA',
  };

  private handleAlterationKey(key: string) {
    const alterationMap: { [key: string]: string } = {
      '1': '♯',
      '2': '♭',
      '3': '♮',
    };
    const alt = alterationMap[key];
    if (alt) this.selectAlteration(alt);
  }

  private handlePuntilloKey(key: string) {
    if (key === '.') {
      this.puntillo = !this.puntillo;
    }
  }

  private handleAddNoteKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addNote();
    }
  }

  private handleToggleSilenceTabKey(key: string) {
    if (key === 'tab') {
      this.selectTab(!this.showSilences);
    }
  }
}
