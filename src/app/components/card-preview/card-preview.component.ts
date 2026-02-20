import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../models/card.model';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { toPng } from 'html-to-image';

@Component({
    selector: 'app-card-preview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './card-preview.component.html',
    styleUrls: ['./card-preview.component.scss']
})
export class CardPreviewComponent implements OnChanges {
    @Input() card!: Card;
    @ViewChild('cardElement') cardElement!: ElementRef;
    @ViewChild('mainContent') mainContent!: ElementRef;

    formattedText: SafeHtml = '';
    backgroundUrl: SafeUrl | null = null;
    debugInfo: string = '';

    private icons: { [key: string]: string[] } = {
        credit: ['[credit]', '[cr]', '[c]'],
        click: ['[click]'],
        link: ['[link]'],
        trash: ['[trash]'],
        mu: ['[mu]'],
        '1mu': ['[1mu]'],
        '2mu': ['[2mu]'],
        subroutine: ['[subroutine]', '[sub]', '--->', '-->', '->'],
        'recurring-credit': ['[recurring]']
    };

    // Art interaction state
    artX: number = 0;
    artY: number = 0;
    artScale: number = 1.0;
    private isDragging: boolean = false;
    private startX: number = 0;
    private startY: number = 0;

    constructor(private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['card']) {
            this.updateView();
        }
    }

    updateView(): void {
        if (!this.card) return;

        this.formattedText = this.iconify(this.card.text);

        if (this.card.imageData) {
            this.backgroundUrl = this.sanitizer.bypassSecurityTrustUrl(this.card.imageData);
        } else {
            this.backgroundUrl = null;
            // Reset position if no image
            this.artX = 0;
            this.artY = 0;
            this.artScale = 1.0;
        }
        this.debugInfo = this.templateUrl;

        // Trigger font adjustment after view update
        setTimeout(() => this.adjustFontSize(), 0);
    }

    adjustFontSize(): void {
        const element = this.mainContent?.nativeElement;
        if (!element) return;

        this.cdr.detectChanges();

        // Reset to initial size or a standard base size before checking
        element.style.fontSize = '';

        let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
        const minFontSize = 6; // Allow smaller size for dense text

        // Calculate available height based on card dimensions
        const cardHeight = 436;
        let paddingBottom = 30; // Margen de seguridad inferior aumentado

        if (this.isIdentity) {
            // Para Identidades, evitar solapamiento con estadísticas inferiores
            paddingBottom = cardHeight - 365;
        }

        const availableHeight = cardHeight - element.offsetTop - paddingBottom;

        // Loop to shrink font size if content overflows
        while (
            (element.scrollHeight > availableHeight || element.scrollWidth > element.clientWidth) &&
            fontSize > minFontSize
        ) {
            fontSize -= 0.5;
            element.style.fontSize = `${fontSize}px`;
        }
    }

    onMouseDown(event: MouseEvent): void {
        if (!this.backgroundUrl) return;
        this.isDragging = true;
        this.startX = event.clientX - this.artX;
        this.startY = event.clientY - this.artY;
        event.preventDefault();
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.isDragging) return;
        this.artX = event.clientX - this.startX;
        this.artY = event.clientY - this.startY;
    }

    onMouseUp(): void {
        this.isDragging = false;
    }

    onWheel(event: WheelEvent): void {
        if (!this.backgroundUrl) return;
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.1 : 0.1;
        this.artScale = Math.max(0.1, this.artScale + delta);
    }

    get templateUrl(): string {
        if (this.card && this.card.kind && this.card.faction) {
            const kind = this.card.kind.toLowerCase();
            const faction = this.card.faction.toLowerCase();
            // Handle capitalized folder names as fallback
            const folder = (kind === 'hardware') ? 'Hardware' : (kind === 'ice') ? 'ICE' : kind;
            return `/assets/img/${folder}/${kind}_${faction}.png`;
        }
        if (this.card && this.card.side) {
            const side = this.card.side.toLowerCase();
            return `/assets/img/${side}-back.jpg`;
        }
        return '/assets/img/corp-back.jpg';
    }

    iconify(text: string): SafeHtml {
        if (!text) return '';

        let content = text;
        for (const [className, finders] of Object.entries(this.icons)) {
            for (const finder of finders) {
                const regex = new RegExp(this.escapeRegExp(finder), 'gi');
                content = content.replace(regex, `<i class='icon icon-${className}'></i>`);
            }
        }
        return this.sanitizer.bypassSecurityTrustHtml(content);
    }

    escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    get isIdentity(): boolean {
        return this.card.kind === 'identity';
    }

    get isProgram(): boolean {
        return this.card?.kind === 'program';
    }

    get hasStrength(): boolean {
        if (!this.card || !this.card.kind) return false;
        return ['agenda', 'asset', 'upgrade', 'ice', 'program'].includes(this.card.kind.toLowerCase());
    }

    private async inlineExternalStyles(): Promise<HTMLStyleElement[]> {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        const styleElements: HTMLStyleElement[] = [];

        for (const link of links as HTMLLinkElement[]) {
            if (link.href && (link.href.includes('googleapis.com') || link.href.includes('jsdelivr.net'))) {
                try {
                    const response = await fetch(link.href);
                    const cssText = await response.text();
                    const style = document.createElement('style');
                    style.textContent = cssText;
                    style.setAttribute('data-inlined-from', link.href);
                    document.head.appendChild(style);
                    styleElements.push(style);
                } catch (e) {
                    console.warn('Failed to inline stylesheet:', link.href, e);
                }
            }
        }
        return styleElements;
    }

    async toImage(): Promise<string> {
        if (!this.cardElement || !this.card) return '';

        let inlinedStyles: HTMLStyleElement[] = [];
        try {
            // Firefox Fix: Inline external stylesheets to allow reading rules
            inlinedStyles = await this.inlineExternalStyles();

            const options = {
                quality: 1.0,
                pixelRatio: 2,
                cacheBust: true,
                skipFonts: false
            };

            const dataUrl = await toPng(this.cardElement.nativeElement, options);

            // Cleanup inlined styles
            inlinedStyles.forEach(s => s.remove());

            if (!dataUrl || dataUrl === 'data:,') {
                throw new Error('Generated image is empty');
            }
            return dataUrl;
        } catch (error) {
            console.error('Error generating image:', error);
            inlinedStyles.forEach(s => s.remove());
            alert('Error al generar la imagen. Revisa la consola o asegúrate de que todas las imágenes han cargado.');
            return '';
        }
    }
}
