// @flow
/* eslint-disable */

/* eslint-disable react/style-prop-object */

import React, { Component } from "react";
import { MuiThemeProvider } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { MuiThemeProvider as V0MuiThemeProvider } from "material-ui";
import { Tabs, Tab } from "material-ui/Tabs";
import RaisedButton from "material-ui/RaisedButton";
import { IntlProvider, FormattedNumber } from "react-intl";
import Divider from "material-ui/Divider";
import Alarm from "material-ui/svg-icons/action/alarm";
import NavigationArrowBack from "material-ui/svg-icons/navigation/arrow-back";
import Moment from "react-moment";
import Summary from "./Summary";
import Activity from "./Activity";
import Games from "./Games";
import NotFound from "../NotFound";
import { getFundFeed } from "../../Services/DbService";
import { appTheme, gMuiTheme } from "../Styles";
import { mgMuiTheme } from "../ManagerStyles";
import WagerDialogContainer from "../../Containers/WagerDialogContainer";
import OnFidoStatusDialog from "./OnFidoStatusDialog";
import MobileTopHeaderContainer from "../../Containers/MobileTopHeaderContainer";
import FundModel from "../../Models/Fund";
import FundDetailHeader from "./FundDetailHeader";

const themeColor = gMuiTheme.palette.themeColor;
const managerThemeColor = mgMuiTheme.palette.themeColor;
const textColor3 = gMuiTheme.palette.textColor3;
const mobileBreakPoint = gMuiTheme.palette.mobileBreakPoint;
const desktopBreakPoint = gMuiTheme.palette.desktopBreakPoint;

const titleStyle = {
  fontSize: 20,
  lineHeight: "28px",
  fontWeight: 500
};

const subtitleStyle = {
  fontSize: 12,
  lineHeight: "16px",
  color: textColor3,
  fontWeight: 400
};

type FundProps = {
  fund: {
    status: string
  },
  match: {
    params: {
      fund: string
    }
  },
  history: {
    goBack: () => {}
  },
  size: number,
  user: User,
  authUser: {
    emailVerified: boolean
  },
  isManager: boolean,
  sendHeader: () => void,
  sendContainer: () => void,
  scrollBack: () => void,
  location: {}
};

export default class Fund extends Component<FundProps> {
  constructor(props) {
    super(props);
    this.fundId = props.match.params.fund;
    this.classesSet = false;
    this.setClasses = this.setClasses.bind(this);
    this.onFundChange = this.onFundChange.bind(this);
    this.setWagering = this.setWagering.bind(this);
    this.endWagering = this.endWagering.bind(this);
    this.openOnfido = this.openOnfido.bind(this);
    this.navBack = this.navBack.bind(this);
    this.renderTabContentContainer = this.renderTabContentContainer.bind(this);
    this.renderPadding = this.renderPadding.bind(this);
    this.state = {
      wagering: false,
      openOnfido: false
    };
  }

  componentWillMount() {
    this.fundFeed = getFundFeed(this.fundId, this.onFundChange);
  }

  componentDidMount() {
    const openWager = window.location.hash.replace("#", "");
    if (openWager === "wager") {
      this.setState({ wagering: true });
    }
    if (!this.classesSet) this.setClasses();
    // this.renderTabContentContainer();
    if (
      this.summaryContainer &&
      this.activityContainer &&
      this.contentHeader &&
      !this.listenerActivated
    ) {
      this.listenerActivated = true;
      if (this.gamesContainer) this.props.sendContainer(this.gamesContainer);
      this.props.sendContainer(this.summaryContainer);
      this.props.sendContainer(this.activityContainer);
      this.props.sendHeader(this.contentHeader);
    }
  }

  componentDidUpdate() {
    if (!this.classesSet) this.setClasses();
    // this.renderTabContentContainer();
    if (
      this.summaryContainer &&
      this.activityContainer &&
      this.contentHeader &&
      !this.listenerActivated
    ) {
      this.listenerActivated = true;
      if (this.gamesContainer) this.props.sendContainer(this.gamesContainer);
      this.props.sendContainer(this.summaryContainer);
      this.props.sendContainer(this.activityContainer);
      this.props.sendHeader(this.contentHeader);
    }
  }

  componentWillUnmount() {
    if (this.fundFeed) this.fundFeed.off();
  }

  onFundChange(fund) {
    if ((!this.props.user || !this.props.user.investments || !this.props.user.investments[fund.id]) && fund.status !== "OPEN")
      this.props.history.replace(`/managers/${fund.manager.id}`)
    this.setState({ fund });
  }

  setClasses() {
    const tabDiv = document.getElementById("FundDetail");
    if (tabDiv) {
      const innerDiv = tabDiv.childNodes[0];
      if (innerDiv) {
        const tabTitle = innerDiv.childNodes[0];
        const tabInk = innerDiv.childNodes[1];
        if (tabTitle && tabInk) {
          this.classesSet = true;
          const tabWrapper = document.createElement("div");
          tabTitle.parentNode.insertBefore(tabWrapper, tabTitle);
          tabWrapper.appendChild(tabTitle);
          tabInk.parentNode.insertBefore(tabWrapper, tabInk);
          tabWrapper.appendChild(tabInk);
          tabWrapper.classList.add("content");
          tabTitle.style.margin = "0 auto";
          tabInk.style.margin = "0 auto";
        }
      }
    }
    let buttonDiv = document.getElementById("SummaryTab");
    if (buttonDiv) {
      buttonDiv.childNodes[0].childNodes[0].style.height = "16px";
    }
    buttonDiv = document.getElementById("ActivityTab");
    if (buttonDiv) {
      buttonDiv.childNodes[0].childNodes[0].style.height = "16px";
    }
    buttonDiv = document.getElementById("GameTab");
    if (buttonDiv) {
      buttonDiv.childNodes[0].childNodes[0].style.height = "16px";
    }
  }

  setWagering(fade) {
    return () => {
      mixpanel.track("Wager Dialog Opened");
      this.setState({ wagering: true, fade });
    }
  }

  endWagering() {
    this.setState({ wagering: false });
  }

  openOnfido() {
    this.setState({ openOnfido: true });
  }

  navBack() {
    this.props.history.goBack();
  }

  renderTabContentContainer() {
    if (this.state.fund) {
      if (this.state.fund.status !== "OPEN") {
        if (
          this.gamesContainer &&
          this.summaryContainer &&
          this.activityContainer
        ) {
          const gamesContainer = this.gamesContainer;
          const summaryContainer = this.summaryContainer;
          const activityContainer = this.activityContainer;
          const gamesRect = gamesContainer.getBoundingClientRect();
          gamesContainer.style.maxHeight = `${
            this.props.size > mobileBreakPoint
              ? window.innerHeight - gamesRect.top
              : window.innerHeight - gamesRect.top - 56
          }px`;
          summaryContainer.style.maxHeight = `${
            this.props.size > mobileBreakPoint
              ? window.innerHeight - gamesRect.top
              : window.innerHeight - gamesRect.top - 56
          }px`;
          activityContainer.style.maxHeight = `${
            this.props.size > mobileBreakPoint
              ? window.innerHeight - gamesRect.top
              : window.innerHeight - gamesRect.top - 56
          }px`;
        }
      } else if (this.summaryContainer && this.activityContainer) {
        const summaryContainer = this.summaryContainer;
        const activityContainer = this.activityContainer;
        const summaryRect = summaryContainer.getBoundingClientRect();
        summaryContainer.style.maxHeight = `${
          this.props.size > mobileBreakPoint
            ? window.innerHeight - summaryRect.top
            : window.innerHeight - summaryRect.top - 56
        }px`;
        activityContainer.style.maxHeight = `${
          this.props.size > mobileBreakPoint
            ? window.innerHeight - summaryRect.top
            : window.innerHeight - summaryRect.top - 56
        }px`;
      }
    }
  }

  renderPadding() {
    if (
      this.props.size > mobileBreakPoint ||
      this.state.fund.status === "OPEN"
    ) {
      return 0;
    }
    return 76;
  }

  renderFundName() {
    const desktopStatusStyle = {
      fontSize: 14,
      fontWeight: 500,
      color: this.props.isManager ? managerThemeColor : themeColor,
      float: "right",
      marginTop: 20
    };

    const mobileStatusStyle = {
      fontSize: 14,
      lineHeight: "28px",
      fontWeight: 500,
      color: this.props.isManager ? managerThemeColor : themeColor,
      position: "absolute",
      right: 0
    };

    const alarmStyle = {
      height: 16,
      fill: textColor3,
      marginBottom: -3
    };

    if (this.props.size > mobileBreakPoint) {
      return (
        <div>
          <NavigationArrowBack
            className="navbackArrow"
            onClick={this.navBack}
          />
          <div style={desktopStatusStyle}>
            {this.state.fund.status === "OPEN" ? (
              <span>
                OPEN <Alarm style={alarmStyle} />
                <span style={subtitleStyle}>
                  Closing in{" "}
                  <Moment
                    key={0}
                    fromNow
                    ago
                    date={this.state.fund.closingTime * 1000}
                  />
                </span>
              </span>
            ) : (
              this.state.fund.status
            )}
          </div>
          <div className="clear" />
          <span style={titleStyle}>{this.state.fund.name}</span>
        </div>
      );
    } else if (this.state.fund.status !== "OPEN") {
      return (
        <div>
          <div style={mobileStatusStyle}>{this.state.fund.status}</div>
          <div
            style={{
              paddingRight: this.renderPadding()
            }}
          >
            <span style={titleStyle}>{this.state.fund.name}</span>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flexContainer" style={{ marginBottom: 8 }}>
          <span style={{ ...subtitleStyle, marginLeft: -6 }}>
            <Alarm style={alarmStyle} />
            Closing in{" "}
            <Moment
              key={0}
              fromNow
              ago
              date={this.state.fund.closingTime * 1000}
            />
          </span>
          <div
            style={{
              color: this.props.isManager ? managerThemeColor : themeColor,
              fontWeight: 500
            }}
          >
            {this.state.fund.status}
          </div>
        </div>
        <span style={titleStyle}>{this.state.fund.name}</span>
      </div>
    );
  }

  render() {
    if (this.state.fund === null) return <NotFound />;

    if (!this.state || !this.state.fund) {
      return (
        <MuiThemeProvider theme={appTheme}>
          <div className="fill-window center-flex">
            <CircularProgress />
          </div>
        </MuiThemeProvider>
      );
    }

    const fadeFund = new FundModel(this.state.fund);
    fadeFund.userReturn(-1);

    let fadeUserWager;
    let fadeUserCurrent;
    let userWager;
    let userCurrent;
    let isFade = false;
    let isUserInPool;

    if (this.state.fund.status === "OPEN") {
      userWager = (this.state.fund.amountWagered || 0) / 100
      fadeUserWager = (this.state.fund.fadeAmountWagered || 0) / 100
    } else if (this.props.user && this.props.user.investments && this.props.user.investments[this.state.fund.id]) {
      userWager = this.props.user.investments[this.state.fund.id];
      if (userWager < 0) isFade = true;
      userCurrent = this.state.fund.userReturn(userWager) / 100;
      userWager = Math.abs(userWager / 100);
      isUserInPool = true;
    } else {
      isUserInPool = false;
      userWager = this.state.fund.amountWagered / 100;
      fadeUserWager = this.state.fund.fadeAmountWagered / 100;
      userCurrent = this.state.fund.amountReturned / 100;
      fadeUserCurrent = this.state.fund.fadeReturned / 100;
    }

    const openSize = this.props.size < desktopBreakPoint ? "100%" : 320;
    const closedSize = this.props.size < desktopBreakPoint ? "100%" : 480;
    const tabBarStyle = {
      width: this.state.fund.status === "OPEN" ? openSize : closedSize,
      height: "48px"
    };

    const tabContentContainerStyle = {
      paddingTop: 16,
      boxSizing: "border-box"
    };

    const SubTitle = props => (
      <div style={subtitleStyle}>
        {`${this.state.fund.league} ${this.state.fund.type}`}
        <br />
        {[
          (props.fund.amountWagered ? props.fund.playerCount : 0) + (props.fund.fadeAmountWagered ? props.fund.fadePlayerCount : 0),
          " Players \u00B7 $",
          props.fund.minInvestment / 100,
          " Minimum / ",
          <FormattedNumber
            key={0}
            style="currency"
            currency="USD"
            minimumFractionDigits={0}
            value={props.fund.maxInvestment / 100}
          />,
          " Maximum \u00B7 ",
          props.fund.percentFee,
          "% Fee"
        ]}
      </div>
    );

    const WagerButton = props =>
      props.open ? (
        <RaisedButton
          primary
          disabled={this.props.authUser && !this.props.authUser.emailVerified}
          label={props.fade ? "BET AGAINST" : "BET WITH"}
          className={props.fade && `fade-wager-button`}
          onClick={this.setWagering(props.fade)}
        />
      ) : null;

    return (
      <V0MuiThemeProvider
        muiTheme={this.props.isManager ? mgMuiTheme : gMuiTheme}
      >
        <IntlProvider locale="en">
          <div
            style={{
              height: this.props.size > mobileBreakPoint ? "100vh" : "100%",
              position: "relative"
            }}
          >
            <div className="FundHeader">
              <div className="contentHeader">
                {this.renderFundName()}
                <div
                  ref={el => {
                    this.contentHeader = el;
                  }}
                  style={{
                    transition: "all 0.3s ease-in-out",
                    height: this.state.fund.status === "OPEN" ? 84 : 132
                  }}
                >
                  <SubTitle fund={this.state.fund} />
                  <div className="manager-fund-detail">
                    <FundDetailHeader
                      fund={this.state.fund}
                      isManager={false}
                      userWager={userWager}
                      userCurrent={userCurrent}
                      fade={isFade}
                    />
                    {(this.state.fund.status === "OPEN" || !this.props.user.investments || !this.props.user.investments[this.state.fund.id]) && <FundDetailHeader
                        fund={fadeFund}
                        isManager={false}
                        userWager={fadeUserWager}
                        userCurrent={isUserInPool ? fadeUserCurrent : userCurrent}
                        fade
                      />}
                  </div>
                </div>
              </div>
            </div>
            <Divider />
            <div className="FillEdges" />
            <div id="FundDetail">
              <Tabs
                inkBarStyle={{
                  background: this.props.isManager
                    ? managerThemeColor
                    : themeColor
                }}
                tabItemContainerStyle={tabBarStyle}
              >
                {this.state.fund.status !== "OPEN" ? (
                  <Tab
                    label="GAMES"
                    id="GameTab"
                    onActive={() => this.props.scrollBack(this.gamesContainer)}
                  >
                    <div
                      style={tabContentContainerStyle}
                      ref={gamesContainer => {
                        this.gamesContainer = gamesContainer;
                        return gamesContainer;
                      }}
                    >
                      <Games
                        size={this.props.size}
                        games={this.state.fund.games}
                        userCurrent={userCurrent}
                        userWager={userWager}
                        fund={this.state.fund}
                        user={this.props.user}
                        isFade={isFade}
                      />
                    </div>
                  </Tab>
                ) : null}
                <Tab
                  label="SUMMARY"
                  id="SummaryTab"
                  onActive={() => this.props.scrollBack(this.summaryContainer)}
                >
                  <div
                    style={tabContentContainerStyle}
                    ref={summaryContainer => {
                      this.summaryContainer = summaryContainer;
                      return summaryContainer;
                    }}
                  >
                    <Summary
                      size={this.props.size}
                      fund={this.state.fund}
                      user={this.props.user}
                      location={this.props.location}
                      allowComments={true}
                    />
                  </div>
                </Tab>
                <Tab
                  label="ACTIVITY"
                  id="ActivityTab"
                  onActive={() => this.props.scrollBack(this.activityContainer)}
                >
                  <div
                    style={tabContentContainerStyle}
                    ref={activityContainer => {
                      this.activityContainer = activityContainer;
                      return activityContainer;
                    }}
                  >
                    <Activity
                      size={this.props.size}
                      user={this.props.user}
                      fund={this.state.fund}
                    />
                  </div>
                </Tab>
              </Tabs>
            </div>
            <div className="wager-button-wrapper">
              <WagerButton open={this.state.fund.status === "OPEN"} user={!!this.props.user} />
              <WagerButton open={this.state.fund.status === "OPEN"} user={!!this.props.user} fade />
            </div>
            <WagerDialogContainer
              user={this.props.user}
              fund={this.state.fund}
              open={this.state.wagering}
              endWagering={this.endWagering}
              size={this.props.size}
              fade={this.state.fade}
            />
            <OnFidoStatusDialog
              user={this.props.user}
              fund={this.state.fund}
              open={this.state.openOnfido}
              size={this.props.size}
              history={this.props.history}
              handleClose={() => {
                this.setState({ openOnfido: false });
              }}
            />
          </div>
        </IntlProvider>
      </V0MuiThemeProvider>
    );
  }
}
