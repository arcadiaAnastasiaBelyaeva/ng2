import {
	Directive,
	Input,
	TemplateRef,
	OnInit
} from '@angular/core';
import { TemplateCacheService } from '../template/template-cache.service';
import { TemplateLink } from '../template/template-link';

@Directive({
	// tslint:disable-next-line
	selector: 'ng-template[qGridColumnFoot]'
})

export class ColumnFootTemplateDirective implements OnInit {
	@Input('qGridColumnFoot') key = '';

	constructor(
		private templateCache: TemplateCacheService,
		private templateRef: TemplateRef<any>
	) {
	}

	ngOnInit() {
		const link = new TemplateLink(this.templateRef, null);
		this.templateCache.put(`foot-cell-the-${this.key}.tpl.html`, link);
	}
}
