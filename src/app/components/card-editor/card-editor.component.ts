import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Card } from '../../models/card.model';

@Component({
    selector: 'app-card-editor',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './card-editor.component.html',
    styleUrls: ['./card-editor.component.scss']
})
export class CardEditorComponent {
    @Output() cardChange = new EventEmitter<Card>();

    cardForm: FormGroup;

    sides = ['corp', 'runner'];
    factions: { [key: string]: string[] } = {
        corp: ['neutral', 'weyland', 'haas', 'jinteki', 'nbn'],
        runner: ['neutral', 'anarch', 'criminal', 'shaper', 'adam', 'apex']
    };
    kinds: { [key: string]: string[] } = {
        corp: ['agenda', 'asset', 'operation', 'upgrade', 'ice', 'identity'],
        runner: ['event', 'hardware', 'program', 'resource', 'identity']
    };

    strengthLabels: { [key: string]: string } = {
        agenda: 'Agenda Points',
        asset: 'Trash Cost',
        upgrade: 'Trash Cost',
        ice: 'Strength',
        program: 'Strength'
    };

    constructor(private fb: FormBuilder) {
        this.cardForm = this.fb.group({
            side: ['corp', Validators.required],
            faction: ['jinteki', Validators.required],
            kind: ['asset', Validators.required],
            uniqueCard: [false],
            name: ['Mokujin', Validators.required],
            subtitle: [''],
            price: [0],
            strength: [2],
            influence: [2],
            mu: [1],
            type: ['ambush'],
            text: ["If you pay 2 [c] when the Runner accesses Mokujin,the runner must take Mokujin.\nWhile the runner has Mokujin he can't run on central servers.\n[click] [click] [click]: Trash Mokujin"],
            fluff: ['"I was completely stumped" - Whizzard'],
            link: [0],
            minDeck: [45],
            maxInfluence: [15],
            imageData: ['']
        });

        this.cardForm.valueChanges.subscribe(val => {
            this.cardChange.emit(val);
        });

        // Initial emit
        setTimeout(() => this.cardChange.emit(this.cardForm.value), 0);
    }

    onSideChange(): void {
        const side = this.currentSide;
        const newFaction = this.factions[side][0];
        const newKind = this.kinds[side][0];
        this.cardForm.patchValue({
            faction: newFaction,
            kind: newKind
        });
    }

    onKindChange(): void {
        // Just to ensure view updates if needed
        this.cardChange.emit(this.cardForm.value);
    }

    get currentSide(): string {
        return this.cardForm.get('side')?.value;
    }

    get currentKind(): string {
        return this.cardForm.get('kind')?.value;
    }

    get availableFactions(): string[] {
        return this.factions[this.currentSide] || [];
    }

    get availableKinds(): string[] {
        return this.kinds[this.currentSide] || [];
    }

    get strengthLabel(): string {
        return this.strengthLabels[this.currentKind] || 'Strength';
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.cardForm.patchValue({ imageData: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    }

    // Helpers for template visibility
    get isIdentity(): boolean { return this.currentKind === 'identity'; }
    get isProgram(): boolean { return this.currentKind === 'program'; }
    get isAgenda(): boolean { return this.currentKind === 'agenda'; }

    hasStrength(): boolean {
        return ['agenda', 'asset', 'upgrade', 'ice', 'program'].includes(this.currentKind);
    }
}
