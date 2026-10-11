import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgentService } from '../../utilities/services/agents/agents.service';
import { ChatMessage } from '../../utilities/models/messages';

@Component({
  selector: 'app-agent-chat',
  imports: [FormsModule],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.scss'
})
export class AgentChatComponent {
  private agentService = inject(AgentService);

  messages: ChatMessage[] = [];
  question = '';
  loading = false;
  isOpen = false;
  
  toggle(): void {
    this.isOpen = !this.isOpen;
  }
  
  send(): void {
    const text = this.question.trim();
    if (!text || this.loading) return;

    this.messages.push({ from: 'user', text });
    this.question = '';
    this.loading = true;

    this.agentService.ask(this.messages).subscribe({
      next: answer => {
        this.messages.push({ from: 'agent', text: answer });

        this.loading = false;
      },
      error: () => {
        this.messages.push({ from: 'agent', text: 'Sorry, something went wrong. Try again.' });
        this.loading = false;
      }
    });
  }
}
