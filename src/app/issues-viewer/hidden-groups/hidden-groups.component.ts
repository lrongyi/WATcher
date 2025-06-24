import { AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Group } from '../../core/models/github/group.interface';
import { FiltersService } from '../../core/services/filters.service';
import { GroupBy, GroupingContextService } from '../../core/services/grouping/grouping-context.service';

@Component({
  selector: 'app-hidden-groups',
  templateUrl: './hidden-groups.component.html',
  styleUrls: ['./hidden-groups.component.css']
})
export class HiddenGroupsComponent implements OnInit, AfterViewInit {
  @Input() groups: Group[] = [];

  @ViewChild('defaultCard') defaultCardTemplate: TemplateRef<any>;
  @ViewChild('assigneeCard') assigneeCardTemplate: TemplateRef<any>;
  @ViewChild('milestoneCard') milestoneCardTemplate: TemplateRef<any>;

  private currentCardTemplate$ = new BehaviorSubject<TemplateRef<any>>(null);
  private filterSubscription: Subscription;

  currentAssignees: string[] = [];

  constructor(public groupingContextService: GroupingContextService, private filtersService: FiltersService) {}

  ngOnInit() {
    this.filterSubscription = this.filtersService.filter$.subscribe((filter) => {
      this.currentAssignees = filter.assignees || [];
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.currentCardTemplate$.next(this.getCardTemplate());
    });
  }

  getCardTemplate(): TemplateRef<any> {
    switch (this.groupingContextService.currGroupBy) {
      case GroupBy.Assignee:
        return this.assigneeCardTemplate;
      case GroupBy.Milestone:
        return this.milestoneCardTemplate;
      default:
        return this.defaultCardTemplate;
    }
  }

  getShowButtonTooltip(): string {
    if (this.groupingContextService.currGroupBy === GroupBy.Assignee) {
      return 'Show Assignee';
    } else if (this.groupingContextService.currGroupBy === GroupBy.Milestone) {
      return 'Show Milestone';
    }
    return '';
  }

  showAssignee(assignee: any): void {
    const currentAssignees: string[] = this.filtersService.filter$.value.assignees || [];
    if (!currentAssignees.includes(assignee.login)) {
      const updatedAssignees = [...currentAssignees, assignee.login];
      this.filtersService.updateFilters({ assignees: updatedAssignees });
    }
  }

  showMilestone(milestone: any): void {
    console.log('show milestone:', milestone);
  }
}
