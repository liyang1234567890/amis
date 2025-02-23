/**
 * @file Tree
 * @description 树形组件
 * @author fex
 */

import React from 'react';
import {eachTree, isVisible} from '../utils/helper';
import {Option, Options, value2array} from './Checkboxes';
import {ClassNamesFn, themeable} from '../theme';
import {highlight} from '../renderers/Form/Options';

interface TreeSelectorProps {
    classPrefix: string;
    classnames: ClassNamesFn;

    highlightTxt: string;

    showIcon?: boolean;
    // 是否默认都展开
    initiallyOpen?: boolean;
    // 默认展开的级数，从1开始，只有initiallyOpen不是true时生效
    unfoldedLevel?: number;
    // 单选时，是否展示radio
    showRadio?: boolean;
    multiple?: boolean;
    // 是否都不可用
    disabled?: boolean;
    // 多选时，选中父节点时，是否将其所有子节点也融合到取值中，默认是不融合
    withChildren?: boolean;
    // 多选时，选中父节点时，是否只将起子节点加入到值中。
    onlyChildren?: boolean;
    // 名称、取值等字段名映射
    nameField?: string;
    valueField?: string;
    iconField?: string;
    unfoldedField?: string;
    foldedField?: string;
    disabledField?: string;
    className?: string;
    itemClassName?: string;
    joinValues?: boolean;
    extractValue?: boolean;
    delimiter?: string;
    data: Options;
    value: any;
    onChange: Function;
    placeholder?: string;
    hideRoot?: boolean;
    rootLabel?: string;
    rootValue?: any;
    cascade?: boolean;
    selfDisabledAffectChildren?: boolean;
    minLength?: number;
    maxLength?: number;
}

interface TreeSelectorState {
    value: Array<any>;
    unfolded: {[propName: string]: string};
}

export class TreeSelector extends React.Component<TreeSelectorProps, TreeSelectorState> {
    static defaultProps = {
        showIcon: true,
        initiallyOpen: true,
        unfoldedLevel: 0,
        showRadio: false,
        multiple: false,
        disabled: false,
        withChildren: false,
        onlyChildren: false,
        nameField: 'name',
        valueField: 'value',
        iconField: 'icon',
        unfoldedField: 'unfolded',
        foldedField: 'foled',
        disabledField: 'disabled',
        joinValues: true,
        extractValue: false,
        delimiter: ',',
        hideRoot: true,
        rootLabel: '顶级',
        rootValue: 0,
        cascade: false,
        selfDisabledAffectChildren: true,
    };

    componentWillMount() {
        this.renderList = this.renderList.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.clearSelect = this.clearSelect.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.toggleUnfolded = this.toggleUnfolded.bind(this);

        const props = this.props;

        this.setState({
            value: value2array(props.value, {
                joinValues: props.joinValues,
                extractValue: props.extractValue,
                multiple: props.multiple,
                delimiter: props.delimiter,
                valueField: props.valueField,
                options: props.data,
            }),
            unfolded: this.syncUnFolded(props),
        });
    }

    componentWillReceiveProps(nextProps: TreeSelectorProps) {
        const toUpdate: any = {};

        if (this.props.value !== nextProps.value || this.props.data !== nextProps.data) {
            toUpdate.value = value2array(nextProps.value, {
                joinValues: nextProps.joinValues,
                extractValue: nextProps.extractValue,
                multiple: nextProps.multiple,
                delimiter: nextProps.delimiter,
                valueField: nextProps.valueField,
                options: nextProps.data,
            });
        }

        if (this.props.data !== nextProps.data) {
            toUpdate.unfolded = this.syncUnFolded(nextProps);
        }

        this.setState(toUpdate);
    }

    syncUnFolded(props: TreeSelectorProps) {
        // 初始化树节点的展开状态
        let unfolded: {[propName: string]: string} = {};
        const {foldedField, unfoldedField} = this.props;

        eachTree(props.data, (node: Option, index, level) => {
            if (node.children && node.children.length) {
                let ret: any = true;

                if (unfoldedField && typeof node[unfoldedField] !== 'undefined') {
                    ret = !!node[unfoldedField];
                } else if (foldedField && typeof node[foldedField] !== 'undefined') {
                    ret = !node[foldedField];
                } else {
                    ret = !!props.initiallyOpen;
                    if (!ret && level <= (props.unfoldedLevel as number)) {
                        ret = true;
                    }
                }
                unfolded[node[props.valueField as string]] = ret;
            }
        });

        return unfolded;
    }

    toggleUnfolded(node: any) {
        this.setState({
            unfolded: {
                ...this.state.unfolded,
                [node[this.props.valueField as string]]: !this.state.unfolded[node[this.props.valueField as string]],
            },
        });
    }

    clearSelect() {
        this.setState(
            {
                value: [],
            },
            () => {
                const {joinValues, rootValue, onChange} = this.props;

                onChange(joinValues ? rootValue : []);
            }
        );
    }

    handleSelect(node: any, value?: any) {
        this.setState(
            {
                value: [node],
            },
            () => {
                const {joinValues, valueField, onChange} = this.props;

                onChange(joinValues ? node[valueField as string] : node);
            }
        );
    }

    handleCheck(item: any, checked: boolean) {
        const props = this.props;
        const value = this.state.value.concat();
        const idx = value.indexOf(item);
        const onlyChildren = this.props.onlyChildren;

        if (checked) {
            ~idx || value.push(item);
            if (!props.cascade) {
                const children = item.children ? item.children.concat([]) : [];

                if (onlyChildren) {
                    // 父级选中的时候，子节点也都选中，但是自己不选中
                    !~idx && children.length && value.shift();

                    while (children.length) {
                        let child = children.shift();
                        let index = value.indexOf(child);

                        if (child.children) {
                            children.push.apply(children, child.children);
                        } else {
                            ~index || value.push(child);
                        }
                    }
                } else {
                    // 只要父节点选择了,子节点就不需要了,全部去掉勾选.  withChildren时相反
                    while (children.length) {
                        let child = children.shift();
                        let index = value.indexOf(child);

                        if (~index) {
                            value.splice(index, 1);
                        }

                        if (props.withChildren) {
                            value.push(child);
                        }

                        if (child.children && child.children.length) {
                            children.push.apply(children, child.children);
                        }
                    }
                }
            }
        } else if (!checked) {
            ~idx && value.splice(idx, 1);

            if (!props.cascade && (props.withChildren || onlyChildren)) {
                const children = item.children ? item.children.concat([]) : [];
                while (children.length) {
                    let child = children.shift();
                    let index = value.indexOf(child);

                    if (~index) {
                        value.splice(index, 1);
                    }

                    if (child.children && child.children.length) {
                        children.push.apply(children, child.children);
                    }
                }
            }
        }

        this.setState(
            {
                value,
            },
            () => {
                const {joinValues, extractValue, valueField, delimiter, onChange} = this.props;

                onChange(
                    joinValues
                        ? value.map(item => item[valueField as string]).join(delimiter)
                        : extractValue
                        ? value.map(item => item[valueField as string])
                        : value
                );
            }
        );
    }

    renderList(
        list: Options,
        value: Option[],
        uncheckable: boolean
    ): {dom: Array<JSX.Element | null>; childrenChecked: number} {
        const {
            itemClassName,
            showIcon,
            showRadio,
            multiple,
            disabled,
            nameField = '',
            valueField = '',
            iconField = '',
            disabledField = '',
            cascade,
            selfDisabledAffectChildren,
            onlyChildren,
            classnames: cx,
            highlightTxt,
            data,
            maxLength,
            minLength
        } = this.props;

        let childrenChecked = 0;
        let ret = list.map((item, key) => {
            if (!isVisible(item as any, data)) {
                return null;
            }

            const checked = !!~value.indexOf(item);
            const selfDisabled = item[disabledField];
            let selfChecked = !!uncheckable || checked;

            let childrenItems = null;
            let tmpChildrenChecked = false;
            if (item.children && item.children.length) {
                childrenItems = this.renderList(
                    item.children,
                    value,
                    cascade
                        ? false
                        : uncheckable || (selfDisabledAffectChildren ? selfDisabled : false) || (multiple && checked)
                );
                tmpChildrenChecked = !!childrenItems.childrenChecked;
                if (!selfChecked && onlyChildren && item.children.length === childrenItems.childrenChecked) {
                    selfChecked = true;
                }
                childrenItems = childrenItems.dom;
            }

            if (tmpChildrenChecked || checked) {
                childrenChecked++;
            }

            let nodeDisabled = !!uncheckable || !!disabled || selfDisabled;

            if (
                !nodeDisabled
                && (
                    (maxLength && !selfChecked && this.state.value.length >= maxLength)
                    || (minLength && selfChecked && this.state.value.length <= minLength)
                )
            ) {
                nodeDisabled = true;
            }

            const checkbox: JSX.Element | null = multiple ? (
                <label className={cx(`Checkbox Checkbox--checkbox Checkbox--sm`)}>
                    <input
                        type="checkbox"
                        disabled={nodeDisabled}
                        checked={selfChecked}
                        onChange={e => this.handleCheck(item, e.currentTarget.checked)}
                    />
                    <i />
                </label>
            ) : showRadio ? (
                <label className={cx(`Checkbox Checkbox--radio Checkbox--sm`)}>
                    <input
                        type="radio"
                        disabled={nodeDisabled}
                        checked={checked}
                        onChange={() => this.handleSelect(item)}
                    />
                    <i />
                </label>
            ) : null;

            const isLeaf = !item.children || !item.children.length;

            return (
                <li
                    key={key}
                    className={cx(`Tree-item ${itemClassName || ''}`, {
                        'Tree-item--isLeaf': isLeaf,
                    })}
                >
                    <a>
                        {!isLeaf ? (
                            <i
                                onClick={() => this.toggleUnfolded(item)}
                                className={cx('Tree-itemArrow', {
                                    'is-folded': !this.state.unfolded[item[valueField]],
                                })}
                            />
                        ) : null}

                        {showIcon ? (
                            <i
                                className={cx(
                                    `Tree-itemIcon ${item[iconField] ||
                                        (childrenItems ? 'Tree-folderIcon' : 'Tree-leafIcon')}`
                                )}
                            />
                        ) : null}

                        {checkbox}

                        <span
                            className={cx('Tree-itemText', {
                                'is-children-checked': multiple && !cascade && tmpChildrenChecked && !nodeDisabled,
                                'is-checked': checked,
                                'is-disabled': nodeDisabled,
                            })}
                            onClick={() =>
                                !nodeDisabled &&
                                (multiple ? this.handleCheck(item, !selfChecked) : this.handleSelect(item))
                            }
                        >
                            {highlightTxt ? highlight(item[nameField], highlightTxt) : item[nameField]}
                        </span>
                    </a>
                    {childrenItems ? (
                        <ul
                            className={cx('Tree-sublist', {
                                'is-folded': !this.state.unfolded[item[valueField]],
                            })}
                        >
                            {childrenItems}
                        </ul>
                    ) : null}
                </li>
            );
        });

        return {
            dom: ret,
            childrenChecked,
        };
    }

    render() {
        const {className, placeholder, hideRoot, rootLabel, showIcon, classnames: cx} = this.props;
        let data = this.props.data;

        const value = this.state.value;
        return (
            <div className={cx(`Tree ${className || ''}`)}>
                {data && data.length ? (
                    <ul className={cx('Tree-list')}>
                        {hideRoot ? (
                            this.renderList(data, value, false).dom
                        ) : (
                            <li className={cx('Tree-item Tree-rootItem')}>
                                <a>
                                    {showIcon ? <i className={cx('Tree-itemIcon Tree-rootIcon')} /> : null}

                                    <label
                                        className={cx('Tree-itemLabel', {
                                            'is-checked': !value || !value.length,
                                        })}
                                    >
                                        <span className={cx('Tree-itemText')} onClick={this.clearSelect}>
                                            {rootLabel}
                                        </span>
                                    </label>
                                </a>
                                <ul className={cx('Tree-sublist')}>{this.renderList(data, value, false).dom}</ul>
                            </li>
                        )}
                    </ul>
                ) : (
                    <div className={cx('Tree-placeholder')}>{placeholder}</div>
                )}
            </div>
        );
    }
}

export default themeable(TreeSelector);
