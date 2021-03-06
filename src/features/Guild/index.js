// @flow

import { Component } from 'react';
import { connect } from 'react-redux';
import T from 'i18n-react';
import { Link } from 'react-router';

import type { Guild as GuildType } from 'flowTypes';

import SvgIcon from 'common/components/Icon/Svg';
import Content from 'common/layouts/Content';
import ContentCard from 'common/components/ContentCard';
import TooltipTrigger from 'common/components/TooltipTrigger';

import Characters from './components/Characters';
import Members from './components/Members';
import Logs from './components/Logs';
import Overview from './components/Overview';
import styles from './styles.less';

import {
  selectGuild,
  fetchGuild,
} from './actions';
import { selector } from './guilds.reducer';

@connect(selector, {
  dispatchSelectGuild: selectGuild,
  dispatchFetchGuild: fetchGuild,
})
export default class Guild extends Component {
  props: {
    guild?: GuildType,
    routeParams: {
      guildName: string,
    },
    dispatchSelectGuild: (name: string) => void,
    dispatchFetchGuild: (name: string) => void,
  };

  componentWillMount () {
    const { guildName } = this.props.routeParams;
    const { dispatchSelectGuild, dispatchFetchGuild } = this.props;

    dispatchSelectGuild(guildName);
    dispatchFetchGuild(guildName);
  }

  render () {
    const { guild, routeParams: { guildName } } = this.props;

    const claimed = guild && guild.claimed;
    const claimedData = {
      logo: claimed ? 'done' : 'error-outline',
      message: claimed ? T.translate('guilds.claimed') : T.translate('guilds.unclaimed'),
    };

    return (
      <Content
        title={`${guildName} [${(guild && guild.tag) || '...'}]`}
        cardExtra={
          <TooltipTrigger data={claimedData.message}>
            <SvgIcon size="mini" className={styles.claimCta} name={claimedData.logo} />
          </TooltipTrigger>
        }
        extraContent={
          <aside>
            <Link to={`/${(guild && guild.leader && guild.leader.alias) || ''}`}>
              <ContentCard type="users" content={guild && guild.leader} />
            </Link>
          </aside>
        }
        content={guild}
        type="guilds"
        tabs={[{
          name: 'Overview',
          to: `/g/${guildName}`,
          ignoreTitle: true,
          content: (
            <Overview data={guild} />
          ),
        }, {
          name: 'Members',
          to: `/g/${guildName}/members`,
          content: <Members name={guildName} />,
        }, {
          name: 'Characters',
          to: `/g/${guildName}/characters`,
          content: <Characters name={guildName} />,
        }, {
          name: 'Logs',
          to: `/g/${guildName}/logs`,
          content: <Logs guildName={guildName} />,
        }]}
      />
    );
  }
}
