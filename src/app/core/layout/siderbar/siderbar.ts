import { Component, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { StyleClassModule } from 'primeng/styleclass';
import { FileUploadModule } from 'primeng/fileupload';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-siderbar',
  imports: [DrawerModule, ButtonModule, AvatarModule, StyleClassModule, RippleModule, DividerModule, FileUploadModule, CommonModule, RouterOutlet, TooltipModule, BreadcrumbModule],
  templateUrl: './siderbar.html',
  styleUrl: './siderbar.css',
})
export class Siderbar {
  @ViewChild('drawerRef') drawerRef!: Drawer;

  closeCallback(e: Event): void {
    this.drawerRef.close(e);
  }

  showMailMenu = false;

  visible: boolean = false;

  items: MenuItem[] = [{ label: 'Components' }, { label: 'Form' }, { label: 'InputText', routerLink: '/inputtext' }];
    home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
}
