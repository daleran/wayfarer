// Conversation registry — maps string IDs to conversation functions.

import { genericHub } from './conversations/genericHub.js';
import { genericDock } from './conversations/genericDock.js';
import { kellHub } from './conversations/kellHub.js';
import { kellDock } from './conversations/kellDock.js';
import { kellIntel } from './conversations/kellIntel.js';
import { kellBounties } from './conversations/kellBounties.js';
import { kellTrade } from './conversations/kellTrade.js';
import { kellRelations } from './conversations/kellRelations.js';
import { ashveilHub } from './conversations/ashveilHub.js';
import { ashveilDock } from './conversations/ashveilDock.js';
import { ashveilTrade } from './conversations/ashveilTrade.js';
import { ashveilBounties } from './conversations/ashveilBounties.js';
import { ashveilIntel } from './conversations/ashveilIntel.js';
import { ashveilRelations } from './conversations/ashveilRelations.js';

export const CONVERSATIONS = {
  genericHub,
  genericDock,
  kellHub,
  kellDock,
  kellIntel,
  kellBounties,
  kellTrade,
  kellRelations,
  ashveilHub,
  ashveilDock,
  ashveilTrade,
  ashveilBounties,
  ashveilIntel,
  ashveilRelations,
};
