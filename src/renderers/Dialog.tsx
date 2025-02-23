import React from 'react';
import PropTypes from 'prop-types';
import Scoped, { ScopedContext, IScopedContext } from '../Scoped';
import { Renderer, RendererProps } from '../factory';
import { ServiceStore, IServiceStore } from '../store/service';
import { observer } from 'mobx-react';
import { SchemaNode, Schema, Action } from '../types';
import { filter } from '../utils/tpl';
import Modal from '../components/Modal';
import findLast = require('lodash/findLast');
import { guid, chainFunctions, isVisible } from '../utils/helper';
import { reaction } from 'mobx';
import { Icon } from '../components/icons';
import { ModalStore, IModalStore } from '../store/modal';
import { findDOMNode } from 'react-dom';

export interface DialogProps extends RendererProps {
    title?: string; // 标题
    size?: 'md' | 'lg' | 'sm' | 'xl';
    closeOnEsc?: boolean;
    onClose: () => void;
    onConfirm: (values: Array<object>, action: Action, ctx: object, targets: Array<any>) => void;
    children?: React.ReactNode | ((props?: any) => React.ReactNode);
    store: IModalStore;
    className?: string;
    header?: SchemaNode;
    body?: SchemaNode;
    headerClassName?: string;
    bodyClassName?: string;
    footer?: SchemaNode;
    confirm?: boolean;
    show?: boolean;
    lazyRender?: boolean;
    wrapperComponent: React.ReactType;
    showCloseButton?: boolean;
}

export interface DialogState {
    entered: boolean;
}

export default class Dialog extends React.Component<DialogProps, DialogState> {
    static propsList: Array<string> = [
        'title',
        'size',
        'closeOnEsc',
        'children',
        'bodyClassName',
        'headerClassName',
        'confirm',
        'onClose',
        'onConfirm',
        'show',
        'body',
        'showCloseButton',
        'actions',
    ];
    static defaultProps: Partial<DialogProps> = {
        title: '弹框',
        bodyClassName: '',
        confirm: true,
        show: true,
        lazyRender: false,
        showCloseButton: true,
        wrapperComponent: Modal,
        closeOnEsc: false,
    };

    reaction: any;
    $$id: string = guid();
    constructor(props: DialogProps) {
        super(props);

        this.state = {
            entered: !!this.props.show,
        };
        this.handleSelfClose = this.handleSelfClose.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handleDialogConfirm = this.handleDialogConfirm.bind(this);
        this.handleDialogClose = this.handleDialogClose.bind(this);
        this.handleDrawerConfirm = this.handleDrawerConfirm.bind(this);
        this.handleDrawerClose = this.handleDrawerClose.bind(this);
        this.handleEntered = this.handleEntered.bind(this);
        this.handleExited = this.handleExited.bind(this);
        this.handleFormInit = this.handleFormInit.bind(this);
        this.handleFormSaved = this.handleFormSaved.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleChildFinished = this.handleChildFinished.bind(this);
    }

    componentWillMount() {
        const store = this.props.store;
        this.reaction = reaction(() => `${store.loading}${store.error}`, () => this.forceUpdate());
    }

    // shouldComponentUpdate(nextProps:DialogProps, nextState:DialogState) {
    //     const props = this.props;

    //     if (this.state.entered !== nextState.entered) {
    //         return true;
    //     } else if (props.show === nextProps.show && !nextProps.show) {
    //         return false;
    //     }

    //     return isObjectShallowModified(this.props, nextProps);
    // }

    componentWillUnmount() {
        this.reaction && this.reaction();
    }

    buildActions(): Array<Action> {
        const { actions, confirm } = this.props;

        if (typeof actions !== 'undefined') {
            return actions;
        }

        let ret: Array<Action> = [];
        ret.push({
            type: 'button',
            actionType: 'cancel',
            label: '取消',
        });

        if (confirm) {
            ret.push({
                type: 'button',
                actionType: 'confirm',
                label: '确认',
                primary: true,
            });
        }

        return ret;
    }

    handleSelfClose() {
        const { onClose, store } = this.props;

        // clear error
        store.updateMessage();
        onClose();
    }

    handleAction(e: React.UIEvent<any>, action: Action, data: object) {
        const { store, onAction } = this.props;

        if (action.type === 'reset') {
            store.reset();
        } else if (action.actionType === 'cancel') {
            this.handleSelfClose();
        } else if (onAction) {
            onAction(e, action, data);
        }
    }

    handleDialogConfirm(values: object[], action: Action, ...args: Array<any>) {
        const { store } = this.props;

        if (action.mergeData && values.length === 1 && values[0]) {
            store.updateData(values[0]);
        }

        const dialog = store.action.dialog as any;

        if (dialog && dialog.onConfirm && dialog.onConfirm(values, action, ...args) === false) {
            return;
        }

        store.closeDialog();
    }

    handleDialogClose(...args: Array<any>) {
        const { store } = this.props;

        const action = store.action as Action;
        const dialog = action.dialog as any;

        if (dialog.onClose && dialog.onClose(...args) === false) {
            return;
        }

        store.closeDialog();
    }

    handleDrawerConfirm(values: object[], action: Action, ...args: Array<any>) {
        const { store } = this.props;

        if (action.mergeData && values.length === 1 && values[0]) {
            store.updateData(values[0]);
        }

        const drawer = store.action.drawer as any;

        if (drawer && drawer.onConfirm && drawer.onConfirm(values, action, ...args) === false) {
            return;
        }

        store.closeDrawer();
    }

    handleDrawerClose(...args: Array<any>) {
        const { store } = this.props;

        const action = store.action as Action;
        const drawer = action.drawer as any;

        if (drawer.onClose && drawer.onClose(...args) === false) {
            return;
        }

        store.closeDrawer();
    }

    handleEntered() {
        this.state.entered ||
            this.setState({
                entered: true,
            });

        const activeElem = document.activeElement as HTMLElement;
        if (activeElem) {
            const dom = findDOMNode(this) as HTMLElement;
            dom && !dom.contains(activeElem) && activeElem.blur();
        }
    }

    handleExited() {
        const { store } = this.props;
        store.reset();
        this.state.entered &&
            this.setState({
                entered: false,
            });
    }

    handleFormInit(data: any) {
        const { store } = this.props;

        store.setFormData(data);
    }

    handleFormChange(data: any) {
        const { store } = this.props;

        store.setFormData(data);
    }

    handleFormSaved(data: any, response: any) {
        const { store } = this.props;

        store.setFormData({
            ...data,
            ...response,
        });
    }

    handleChildFinished(value: any, action: Action) {
        // 下面会覆盖
    }

    openFeedback(dialog: any, ctx: any) {
        return new Promise(resolve => {
            const {store} = this.props;
            store.setCurrentAction({
                type: 'button',
                actionType: 'dialog',
                dialog: dialog,
            });
            store.openDialog(ctx, undefined, confirmed => {
                resolve(confirmed);
            });
        });
    }

    renderBody(body: SchemaNode, key?: any): React.ReactNode {
        let { render, store } = this.props;

        if (Array.isArray(body)) {
            return body.map((body, key) => this.renderBody(body, key));
        }

        let subProps: any = {
            key,
            disabled: body && (body as any).disabled || store.loading,
            onAction: this.handleAction,
            onFinished: this.handleChildFinished,
        };

        if (!(body as Schema).type) {
            return render(`body${key ? `/${key}` : ''}`, body, subProps);
        }

        let schema: Schema = body as Schema;

        if (schema.type === 'form') {
            schema = {
                mode: 'horizontal',
                wrapWithPanel: false,
                submitText: null,
                ...schema,
            };

            // 同步数据到 Dialog 层，方便 actions 根据表单数据联动。
            subProps.onChange = chainFunctions(this.handleFormChange, schema.onChange);
            subProps.onInit = chainFunctions(this.handleFormInit, schema.onInit);
            subProps.onSaved = chainFunctions(this.handleFormSaved, schema.onSaved);
        }

        return render(`body${key ? `/${key}` : ''}`, schema, subProps);
    }

    renderFooter() {
        const actions = this.buildActions();

        if (!actions || !actions.length) {
            return null;
        }

        const { store, render, classnames: cx } = this.props;

        return (
            <div className={cx('Modal-footer')}>
                {store.loading || store.error ? (
                    <div className={cx('Dialog-info')} key="info">
                        {store.loading
                            ? render(
                                'info',
                                {
                                    type: 'spinner',
                                },
                                {
                                    key: 'info',
                                    size: 'sm',
                                }
                            )
                            : null}
                        {store.error ? <span className={cx('Dialog-error')}>{store.msg}</span> : null}
                    </div>
                ) : null}
                {actions.map((action, key) =>
                    render(`action/${key}`, action, {
                        data: store.formData,
                        onAction: this.handleAction,
                        key,
                        disabled: action.disabled || store.loading,
                    })
                )}
            </div>
        );
    }

    render() {
        const {
            className,
            size,
            closeOnEsc,
            title,
            store,
            render,
            header,
            body,
            bodyClassName,
            headerClassName,
            show,
            lazyRender,
            wrapperComponent,
            showCloseButton,
            env,
            classnames: cx,
            classPrefix,
        } = this.props;

        // console.log('Render Dialog');
        const Wrapper = wrapperComponent || Modal;

        return (
            <Wrapper
                classPrefix={classPrefix}
                className={cx(className)}
                size={size}
                backdrop="static"
                onHide={this.handleSelfClose}
                keyboard={closeOnEsc && !store.loading}
                closeOnEsc={closeOnEsc}
                show={show}
                onEntered={this.handleEntered}
                onExited={this.handleExited}
                container={env && env.getModalContainer ? env.getModalContainer() : undefined}
                enforceFocus={false}
                disabled={store.loading}
            >
                {title && typeof title === 'string' ? (
                    <div className={cx('Modal-header', headerClassName)}>
                        {showCloseButton !== false && !store.loading ? (
                            <a data-tooltip="关闭弹窗" onClick={this.handleSelfClose} className={cx('Modal-close')}>
                                <Icon icon="close" className="icon" />
                            </a>
                        ) : null}
                        <div className={cx('Modal-title')}>{filter(title, store.formData)}</div>
                    </div>
                ) : title ? (
                    <div className={cx('Modal-header', headerClassName)}>
                        {showCloseButton !== false && !store.loading ? (
                            <a data-tooltip="关闭弹窗" onClick={this.handleSelfClose} className={cx('Modal-close')}>
                                <Icon icon="close" className="icon" />
                            </a>
                        ) : null}
                        {render('title', title, {
                            data: store.formData,
                        })}
                    </div>
                ) : showCloseButton !== false && !store.loading ? (
                    <a data-tooltip="关闭弹窗" onClick={this.handleSelfClose} className={cx('Modal-close')}>
                        <Icon icon="close" className="icon" />
                    </a>
                ) : null}

                {header
                    ? render('header', header, {
                        data: store.formData,
                    })
                    : null}

                {!this.state.entered && lazyRender ? (
                    <div className={cx('Modal-body', bodyClassName)} />
                ) : body ? (
                    <div className={cx('Modal-body', bodyClassName)}>{this.renderBody(body, 'body')}</div>
                ) : null}

                {this.renderFooter()}

                {body
                    ? render(
                        'drawer',
                        {
                            // 支持嵌套
                            ...((store.action as Action) && ((store.action as Action).drawer as object)),
                            type: 'drawer',
                        },
                        {
                            key: 'drawer',
                            data: store.drawerData,
                            onConfirm: this.handleDrawerConfirm,
                            onClose: this.handleDrawerClose,
                            show: store.drawerOpen,
                            onAction: this.handleAction,
                        }
                    )
                    : null}

                {body
                    ? render(
                        'dialog',
                        {
                            // 支持嵌套
                            ...((store.action as Action) && ((store.action as Action).dialog as object)),
                            type: 'dialog',
                        },
                        {
                            key: 'dialog',
                            data: store.dialogData,
                            onConfirm: this.handleDialogConfirm,
                            onClose: this.handleDialogClose,
                            show: store.dialogOpen,
                            onAction: this.handleAction,
                        }
                    )
                    : null}
            </Wrapper>
        );
    }
}

@Renderer({
    test: /(^|\/)dialog$/,
    storeType: ModalStore.name,
    storeExtendsData: false,
    name: 'dialog',
    isolateScope: true,
})
export class DialogRenderer extends Dialog {
    static contextType = ScopedContext;

    componentWillMount() {
        const scoped = this.context as IScopedContext;
        scoped.registerComponent(this);
        super.componentWillMount();
    }

    componentWillUnmount() {
        const scoped = this.context as IScopedContext;
        scoped.unRegisterComponent(this);
        super.componentWillUnmount();
    }

    tryChildrenToHandle(action: Action, ctx: object, rawAction?: Action) {
        const scoped = this.context as IScopedContext;

        if (action.fromDialog) {
            return false;
        }

        const components = scoped.getComponents();
        const targets: Array<any> = [];
        const { onConfirm, store } = this.props;

        if (action.target) {
            targets.push(
                ...action.target
                    .split(',')
                    .map(name => scoped.getComponentByName(name))
                    .filter(item => item && item.doAction)
            );
        }

        if (!targets.length) {
            const form = findLast(components, component => component.props.type === 'form');
            form && targets.push(form);

            const crud = findLast(components, component => component.props.type === 'crud');
            crud && targets.push(crud);
        }

        if (targets.length) {
            store.markBusying(true);
            store.updateMessage();

            Promise.all(
                targets.map(target =>
                    target.doAction(
                        {
                            ...action,
                            from: this.$$id,
                        },
                        ctx,
                        true
                    )
                )
            )
                .then(values => {
                    if (
                        (action.type === 'submit' ||
                            action.actionType === 'submit' ||
                            action.actionType === 'confirm') &&
                        action.close !== false
                    ) {
                        onConfirm && onConfirm(values, rawAction || action, ctx, targets);
                    } else if (action.close) {
                        this.handleSelfClose();
                    }
                    store.markBusying(false);
                })
                .catch(reason => {
                    store.updateMessage(reason.message, true);
                    store.markBusying(false);
                });

            return true;
        }

        return false;
    }

    handleAction(
        e: React.UIEvent<any>,
        action: Action,
        data: object,
        throwErrors: boolean = false,
        delegate?: boolean,
    ) {
        const { onAction, store, onConfirm, env } = this.props;

        if (action.from === this.$$id) {
            return onAction ? onAction(e, action, data, throwErrors, true) : false;
        }

        const scoped = this.context as IScopedContext;
        delegate || store.setCurrentAction(action);

        if (action.type === 'reset') {
            store.reset();
        } else if (action.actionType === 'close' || action.actionType === 'cancel') {
            this.handleSelfClose();
        } else if (action.actionType === 'confirm') {
            this.tryChildrenToHandle(
                {
                    ...action,
                    actionType: 'submit',
                },
                data,
                action
            ) || this.handleSelfClose();
        } else if (action.actionType === 'next' || action.actionType === 'prev') {
            if (action.type === 'submit') {
                this.tryChildrenToHandle(
                    {
                        ...action,
                        actionType: 'submit',
                    },
                    data,
                    action
                ) || this.handleSelfClose();
            } else {
                onConfirm([data], action, data, []);
            }
        } else if (action.actionType === 'dialog') {
            store.openDialog(data);
        } else if (action.actionType === 'drawer') {
            store.openDrawer(data);
        } else if (action.actionType === 'reload') {
            action.target && scoped.reload(action.target, data);
        } else if (this.tryChildrenToHandle(action, data)) {
            // do nothing
        } else if (action.actionType === 'ajax') {
            store
                .saveRemote(action.api as string, data, {
                    successMessage: (action.messages && action.messages.success) ,
                    errorMessage: (action.messages && action.messages.failed),
                })
                .then(async () => {
                    if (action.feedback && isVisible(action.feedback, store.data)) {
                        await this.openFeedback(action.feedback, store.data);
                    }

                    action.redirect && env.jumpTo(filter(action.redirect, store.data), action);
                    action.reload && this.reloadTarget(action.reload, store.data);
                })
                .catch(() => {});
        } else if (onAction) {
            let ret = onAction(e, action, data, throwErrors, true);
            action.close && (ret && ret.then ? ret.then(this.handleSelfClose) : setTimeout(this.handleSelfClose, 200));
        }
    }

    handleChildFinished(value: any, action: Action) {
        if ((action && action.from === this.$$id) || action.close === false) {
            return;
        }

        const scoped = this.context as IScopedContext;
        const components = scoped
            .getComponents()
            .filter((item: any) => !~['drawer', 'dialog'].indexOf(item.props.type));
        const onConfirm = this.props.onConfirm;
        const onClose = this.props.onClose;

        if (
            components.length === 1 &&
            (components[0].props.type === 'form' || components[0].props.type === 'wizard') &&
            (action.close === true || components[0].props.closeDialogOnSubmit !== false)
        ) {
            onConfirm && onConfirm([value], action, {}, components);
        } else if (action.close === true) {
            onClose();
        }
    }

    handleDialogConfirm(values: object[], action: Action, ...rest: Array<any>) {
        super.handleDialogConfirm(values, action, ...rest);
        const scoped = this.context as IScopedContext;
        const store = this.props.store;
        const dialogAction = store.action as Action;

        if (dialogAction.reload) {
            scoped.reload(dialogAction.reload, store.data);
        } else if (action.reload) {
            scoped.reload(action.reload, store.data);
        } else {
            // 没有设置，则自动让页面中 crud 刷新。
            scoped
                .getComponents()
                .filter((item: any) => item.props.type === 'crud')
                .forEach((item: any) => item.reload && item.reload());
        }
    }

    handleDrawerConfirm(values: object[], action: Action, ...rest: Array<any>) {
        super.handleDrawerConfirm(values, action);
        const scoped = this.context as IScopedContext;
        const store = this.props.store;
        const drawerAction = store.action as Action;

        // 稍等会，等动画结束。
        setTimeout(() => {
            if (drawerAction.reload) {
                scoped.reload(drawerAction.reload, store.data);
            } else if (action.reload) {
                scoped.reload(action.reload, store.data);
            } else {
                // 没有设置，则自动让页面中 crud 刷新。
                scoped
                    .getComponents()
                    .filter((item: any) => item.props.type === 'crud')
                    .forEach((item: any) => item.reload && item.reload());
            }
        }, 300);
    }

    reloadTarget(target: string, data?: any) {
        const scoped = this.context as IScopedContext;
        scoped.reload(target, data);
    }
}
