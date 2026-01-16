import { Component, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { StyleClassModule } from 'primeng/styleclass';
import { FileUploadModule } from 'primeng/fileupload';
@Component({
  selector: 'app-siderbar',
  imports: [DrawerModule, ButtonModule, AvatarModule, StyleClassModule, RippleModule, DividerModule, FileUploadModule],
  templateUrl: './siderbar.html',
  styleUrl: './siderbar.css',
})
export class Siderbar {
  @ViewChild('drawerRef') drawerRef!: Drawer;

  closeCallback(e: Event): void {
    this.drawerRef.close(e);
  }

  visible: boolean = false;
}
