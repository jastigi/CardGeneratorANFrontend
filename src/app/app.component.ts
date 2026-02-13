import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CardEditorComponent } from './components/card-editor/card-editor.component';
import { CardPreviewComponent } from './components/card-preview/card-preview.component';
import { Card } from './models/card.model';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, CardEditorComponent, CardPreviewComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    @ViewChild(CardPreviewComponent) preview!: CardPreviewComponent;

    title = 'card-frontend';
    currentCard!: Card;

    updateCard(card: Card) {
        this.currentCard = card;
    }

    async onGenerate() {
        const dataUrl = await this.preview.toImage();
        if (dataUrl) {
            const win = window.open();
            if (win) {
                win.document.write(`
                    <html>
                        <head><title>Generated Card - ${this.currentCard?.name}</title></head>
                        <body style="margin:0; background: #222; display: flex; align-items: center; justify-content: center;">
                            <img src="${dataUrl}" style="max-height: 90vh; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
                        </body>
                    </html>
                `);
                win.document.close();
            } else {
                alert('El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio.');
            }
        }
    }

    async onSave() {
        const dataUrl = await this.preview.toImage();
        if (dataUrl) {
            const link = document.createElement('a');
            const fileName = this.currentCard?.name?.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_') || 'netrunner_card';
            link.download = `${fileName}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
