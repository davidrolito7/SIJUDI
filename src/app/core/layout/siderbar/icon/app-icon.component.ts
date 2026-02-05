import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="inline-block w-16 h-16"
      focusable="false"
      aria-hidden="true"
    >
      <use [attr.href]="href()"></use>
    </svg>
  `,
})
export class AppIcon {
  name = input.required<string>();
  href = computed(() => `assets/icons/sprite.svg#${this.name()}`);
}
