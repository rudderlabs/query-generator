import * as React from "react";
import * as ReactDOM from "react-dom";
import { inject, observer } from "mobx-react";

import { Select, Typography, Divider } from "antd";
import { Button, Row, Col, Card } from "antd";
import { IEventStore } from "../../app-stores/events";
import { IProp } from "../../models/properties";
import { IVal } from "../../models/values";
import { IEvent, Event } from "../../models/event";
import { eventNames } from "cluster";
import { WhereClauseRow } from "../whereclause";
import { GroupClauseRow } from "../groupclause";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { IWhereClause } from "../eventrows";
import { Label, EventLabel, LabelButton, UserLabel } from "../../App";
import { ReactComponent as Plus } from "../../plus.svg";
import "./index.css";

import styled from "styled-components";

// margin-left: 0 ;
// margin-right: auto;
// margin-top: 26px;
export const UserGroupContent = styled.div`
display: flex;
flex-flow: column wrap;

`
const { Option } = Select;

export interface IUserGroupProperty {
  updateSqlState(whereRows:IWhereClause[]): void
}
export interface IUserGroupState {
  whereClauseList: IWhereClause[];
}

export class UserGroup extends React.Component<IUserGroupProperty, IUserGroupState> {
  lastWhereClauseIndex = 0;

  constructor(props: any) {
    super(props);
    this.state = {
      whereClauseList: [],
    };
  }

  updateProperty = (
    rowIndex: number,
    whereClauseIndex: number,
    value: string
  ) => {
    this.setState({
      whereClauseList: this.state.whereClauseList.map<IWhereClause>(
        (clause: IWhereClause) => {
          if (clause.whereClauseIndex == whereClauseIndex) {
            clause.property = value;
          }
          return clause;
        }
      ),
    });

    setTimeout(() => {
      this.props.updateSqlState(this.state.whereClauseList)
    })
  };

  updatePropertyValue = (
    rowIndex: number,
    whereClauseIndex: number,
    value: string
  ) => {
    this.setState({
      whereClauseList: this.state.whereClauseList.map<IWhereClause>(
        (clause: IWhereClause) => {
          if (clause.whereClauseIndex == whereClauseIndex) {
            clause.propertyValue = value;
          }
          return clause;
        }
      ),
    });

    setTimeout(() => {
      this.props.updateSqlState(this.state.whereClauseList)
    })
  };

  updateCompValue = (
    rowIndex: number,
    whereClauseIndex: number,
    value: string
  ) => {
    this.setState({
      whereClauseList: this.state.whereClauseList.map<IWhereClause>(
        (clause: IWhereClause) => {
          if (clause.whereClauseIndex == whereClauseIndex) {
            clause.compValue = value;
          }
          return clause;
        }
      ),
    });

    setTimeout(() => {
      this.props.updateSqlState(this.state.whereClauseList)
    })
  };

  onRemoveWhereClause = (eventRowIndex: number, whereClauseIndex: number) => {
    console.log("===removing index===" + whereClauseIndex);

    this.setState({
      whereClauseList: this.state.whereClauseList.filter((clause) => {
        return clause.whereClauseIndex != whereClauseIndex;
      }),
    });

    setTimeout(() => {
      this.props.updateSqlState(this.state.whereClauseList)
    })
  };

  onWhereButtonClicked = () => {
    let event: any = new Event("", "users");
    console.log("===index assigned===", this.lastWhereClauseIndex);

    this.setState({
      whereClauseList: this.state.whereClauseList.concat({
        event: event,
        property: "",
        propertyValue: "",
        compValue: "",
        eventRowIndex: 0,
        whereClauseIndex: this.lastWhereClauseIndex++,
        removeFn: this.onRemoveWhereClause,
        updateProperty: this.updateProperty,
        updatePropertyValue: this.updatePropertyValue,
        updateCompValue: this.updateCompValue,
      }),
    });

    setTimeout(() => {
      this.props.updateSqlState(this.state.whereClauseList)
    })
  };

  fetchState = () => {
    console.log(
      "=======USERGROUP STATE======= ",
      console.log(this.state.whereClauseList)
    );
    return this.state.whereClauseList;
  };

  render() {
    console.log(
      "update user group state length: " + this.state.whereClauseList.length
    );
    return (
      <>
      <UserGroupContent>
        <div>
        <UserLabel> Users </UserLabel>
        <LabelButton onClick={() => this.onWhereButtonClicked()}> 
          <Plus />
          ADD USERS 
        </LabelButton>
        </div>

        {/* <p>Users</p>

        <Button
          type="primary"
          shape="round"
          icon={<PlusCircleOutlined />}
          size="middle"
          disabled={this.state.whereClauseList.length > 0 && this.state.whereClauseList[this.state.whereClauseList.length-1].property == ''}
          onClick={() => this.onWhereButtonClicked()}
        >
          Add User Filters...
        </Button> */}
        {this.state.whereClauseList.map((clause) => (
          <div className="user-group-where-clause-content">
          <WhereClauseRow whereClauseList={clause} />
          </div>
        ))}

        
      </UserGroupContent>
      </>
    );
  }
}
