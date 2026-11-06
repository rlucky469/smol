import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Conversation } from '../../core/common/conversation/conversation';
import { SideBar } from '../../core/common/side-bar/side-bar';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-chat-layout',
  imports: [RouterLink, Conversation,  SideBar, NgClass ],
  templateUrl: './chat-layout.html',
  styleUrl: './chat-layout.scss',
  encapsulation: ViewEncapsulation.None
})
export class ChatLayout {


  
    isSideBarHide:boolean = false;


    isSideBarMini: boolean = false;




    constructor(


    ) {



    }




    ngOnInit(): void {




    }



    handleSideBar(event: any) {
        this.isSideBarMini = this.toBoolean(event);
    }

    handleSidebarMobile(event: any){
        this.isSideBarHide = false;
    }

    toBoolean(value: string): boolean {
        return value?.toLowerCase() === 'true';
    }

}
