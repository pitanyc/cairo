// ========================================================================
// Copyright 2006 Mort Bay Consulting Pty. Ltd.
// ------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at 
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//========================================================================

package org.mortbay.cometd;

import com.vh.msg.bean.MessageBean;       /* CAIRO */
import com.vh.msg.bean.MessageStyleBean;  /* CAIRO */
import com.vh.msg.bean.TranslateBean;     /* CAIRO */
import com.vh.msg.bean.UserBean;          /* CAIRO */
import com.vh.msg.util.Constants;         /* CAIRO */

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import javax.servlet.ServletContext;

import org.mortbay.util.DateCache;

/* ------------------------------------------------------------ */
/**
 * @author gregw
 * 
 */
public class Bayeux
{
    public static final String META_CONNECT="/meta/connect";
    public static final String META_DISCONNECT="/meta/disconnect";
    public static final String META_HANDSHAKE="/meta/handshake";
    public static final String META_PING="/meta/ping";
    public static final String META_RECONNECT="/meta/reconnect";
    public static final String META_STATUS="/meta/status";
    public static final String META_SUBSCRIBE="/meta/subscribe";
    public static final String META_UNSUBSCRIBE="/meta/unsubscribe";

    public static final String CLIENT_ATTR="clientId";
    public static final String DATA_ATTR="data";
    public static final String CHANNEL_ATTR="channel";
    public static final String TIMESTAMP_ATTR="timestamp";
    public static final String TRANSPORT_ATTR="transport";
    public static final String ADVICE_ATTR="advice";

    private static final JSON.Literal __NO_ADVICE = new JSON.Literal("{}");
    HashMap _channels=new HashMap();
    HashMap _clients=new HashMap();
    HashMap _users=new HashMap();  /* CAIRO */
    ServletContext _context;
    DateCache _dateCache=new DateCache();
    Random _random=new Random(System.currentTimeMillis());
    HashMap _handlers=new HashMap();
    HashMap _transports=new HashMap();
    HashMap _filters=new HashMap();
    ArrayList _filterOrder= new ArrayList();
    SecurityPolicy _securityPolicy=new DefaultPolicy();
    Object _advice = new JSON.Literal("{\"reconnect\":\"retry\",\"interval\":0,\"transport\":{\"long-polling\":{}}}");

    {
        _handlers.put("*",new PublishHandler());
        _handlers.put(META_HANDSHAKE,new HandshakeHandler());
        _handlers.put(META_CONNECT,new ConnectHandler());
        _handlers.put(META_RECONNECT,new ReconnectHandler());
        _handlers.put(META_DISCONNECT,new DisconnectHandler());
        _handlers.put(META_SUBSCRIBE,new SubscribeHandler());
        _handlers.put(META_UNSUBSCRIBE,new UnsubscribeHandler());
        _handlers.put(META_STATUS,new StatusHandler());
        _handlers.put(META_PING,new PingHandler());

        _transports.put("iframe",IFrameTransport.class);
        _transports.put("long-polling",PlainTextJSONTransport.class);
    }

    Bayeux(ServletContext context)
    {
        _context=context;
    }

    /* ------------------------------------------------------------ */
    /**
     * @param id
     * @return
     */
    public Channel getChannel(String id)
    {
        return (Channel)_channels.get(id);
    }


    /* ------------------------------------------------------------ */
    /**
     * @param channels A {@link ChannelPattern}
     * @param filter The filter instance to apply to new channels matching the pattern
     */
    public void addFilter(String channels, DataFilter filter)
    {
        synchronized (_filters)
        {
            ChannelPattern pattern=new ChannelPattern(channels);
            _filters.put(pattern,filter);
            _filterOrder.remove(pattern);
            _filterOrder.add(pattern);
        }
    }
    
    /* ------------------------------------------------------------ */
    /**
     * @param id
     * @return
     */
    public Channel newChannel(String id)
    {
        Channel channel=(Channel)_channels.get(id);
        if (channel==null)
        {
            channel=new Channel(id,this);
            
            Iterator p = _filterOrder.iterator();
            while(p.hasNext())
            {
                ChannelPattern pattern = (ChannelPattern)p.next();
                if (pattern.matches(id))
                    channel.addDataFilter((DataFilter)_filters.get(pattern));
            }
            
            _channels.put(id,channel);
        }
        return channel;
    }

    /* ------------------------------------------------------------ */
    /**
     * @return
     */
    public Set getChannelIDs()
    {
        return _channels.keySet();
    }

    /* ------------------------------------------------------------ */
    /**
     * @param client_id
     * @return
     */
    public synchronized Client getClient(String client_id)
    {
        return (Client)_clients.get(client_id);
    }

    /* ------------------------------------------------------------ */
    /**
     * @param client_id
     * @return
     */
    public synchronized Client newClient()
    {
        Client client = new Client(); 
        _clients.put(client.getId(),client); 
        return client;
    }

    /* ------------------------------------------------------------ */
    /**
     * @return
     */
    public Set getClientIDs()
    {
        return _clients.keySet();
    }

	/* CAIRO... */

	/**
	 * Get the UserBean with the given userName.
	 */
    public synchronized UserBean getUser(String userName) {
        return (UserBean)_users.get(userName);
    }

	/**
	 * Create a new user with given userName, set the new user's status
	 * to USERSTATUS_ONLINE and put this new UserBean into the _users HashMap.
	 */
	public synchronized UserBean newUser(String clientId, String userName) {
        UserBean user = new UserBean(clientId,
			                         userName,
			                         Constants.USERSTATUS_ONLINE,
									 "",	//customAwayMsg
			                         "");	//buddyIcon
        _users.put(userName, user);
        return user;
    }

	/**
	 * Get all users, and publish a message on the channel of the incoming
	 * user parameter with the all users array.
	 */
    public void getUsers(UserBean user) {
		Object[] theArray = _users.values().toArray();
		HashMap msg = new HashMap();
		msg.put("eventType", Constants.EVENTTYPE_GET_USERS);
		msg.put("users", theArray);
		Channel channel = getChannel(user.getUserName());
		channel.publish(msg);
	}

    /**
	 * Send a message on every channel where there is at least 1 subscriber
	 * about the status change of the incoming user.
	 */
	public void notifyPartners(UserBean user, int eventType) {
        Collection allChannelsColl = _channels.values();    //Collection of Channels
	    Iterator it = allChannelsColl.iterator();           //Iterator over Channels
		while(it.hasNext()) {
			Channel channel = (Channel)it.next();
			//System.out.println("\n\nnotifyPartners: channel: <" + channel.getId() + ">:<" + channel.getSubscriberCount() + ">\n\n");
			if( (channel.getId() != user.getUserName()) && 
				(channel.getId().indexOf('/') == -1)    &&
			    (channel.getSubscriberCount() > 0) ) { //need to notify this partner
				//System.out.println("\n\nnotifyPartners: OKAY CHANNEL: <" + channel.getId() + ">:<" + channel.getSubscriberCount() + ">\n\n");
				HashMap msg = new HashMap();
				msg.put("eventType",      eventType);
				msg.put("userName",       user.getUserName());
				msg.put("status",		  user.getStatus());
				msg.put("customAwayMsg",  user.getCustomAwayMsg());
				msg.put("buddyIcon",      user.getBuddyIcon());
				channel.publish(msg);
			}
		}
	}

	/* ...CAIRO */



    /* ------------------------------------------------------------ */
    /**
     * @return
     */
    String getTimeOnServer()
    {
        return _dateCache.format(System.currentTimeMillis());
    }

    /* ------------------------------------------------------------ */
    /**
     * @param client
     * @param message
     * @return
     */
    Transport newTransport(Client client, Map message)
    {
        try
        {
            String type=client==null?null:client.getConnectionType();
            if (type==null)
                type=(String)message.get("connectionType");

            if (type!=null)
            {
                Class trans_class=(Class)_transports.get(type);
                if (trans_class!=null)
                    return (Transport)(trans_class.newInstance());
            }
            return new PlainTextJSONTransport();
        }
        catch (Exception e)
        {
            throw new RuntimeException(e);
        }
    }

    /* ------------------------------------------------------------ */
    /**
     * @param client
     * @param transport
     * @param message
     * @return
     */
    void handle(Client client, Transport transport, Map message)
        throws IOException
    {
        String channel_id=(String)message.get(CHANNEL_ATTR);
        
        Handler handler=(Handler)_handlers.get(channel_id);
        if (handler==null)
            handler=(Handler)_handlers.get("*");

        handler.handle(client,transport,message);
    }
    
    /* ------------------------------------------------------------ */
    void advise(Client client, Transport transport, Object advice) throws IOException
    {
        if (advice==null)
            advice=_advice;
        if (advice==null)
            advice=__NO_ADVICE;
        String connection_id="/meta/connections/"+client.getId();
        Map reply=new HashMap();
        reply.put(CHANNEL_ATTR,connection_id);
        reply.put("connectionId",connection_id);
        reply.put("timestamp",_dateCache.format(System.currentTimeMillis()));
        reply.put("successful",Boolean.TRUE);
        reply.put(ADVICE_ATTR,advice);
        transport.send(reply);
    }

    /* ------------------------------------------------------------ */
    long getRandom()
    {
        long l=_random.nextLong();
        return l<0?-l:l;
    }

    /* ------------------------------------------------------------ */
    public SecurityPolicy getSecurityPolicy()
    {
        return _securityPolicy;
    }

    /* ------------------------------------------------------------ */
    public void setSecurityPolicy(SecurityPolicy securityPolicy)
    {
        _securityPolicy=securityPolicy;
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private interface Handler
    {
        void handle(Client client, Transport transport, Map message)
            throws IOException;
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class ConnectHandler implements Handler
    {
        public void handle(Client client, Transport transport, Map message)
           throws IOException
        {
            Map reply=new HashMap();
            reply.put(CHANNEL_ATTR,META_CONNECT);
            
            if (client==null)
                throw new IllegalStateException("No client");
            String type=(String)message.get("connectionType");
            client.setConnectionType(type);
            String connection_id="/meta/connections/"+client.getId();
            Channel channel=getChannel(connection_id);
            if (channel!=null)
            {
                channel.addSubscriber(client);
                reply.put("successful",Boolean.TRUE);
                reply.put("error","");
            }
            else
            {
                reply.put("successful",Boolean.FALSE);
                reply.put("error","unknown client ID");
            }
            reply.put("connectionId",connection_id);
            reply.put("timestamp",_dateCache.format(System.currentTimeMillis()));
            transport.send(reply);
            transport.setPolling(true);
        }
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class PublishHandler implements Handler
    {
        public void handle(Client client, Transport transport, Map message)
            throws IOException
        {
            String channel_id=(String)message.get("channel");

            Channel channel=getChannel(channel_id);
            Object data=message.get("data");

            if (client==null)
            {
               if (_securityPolicy.authenticate((String)message.get("authScheme"),(String)message.get("authUser"),(String)message.get("authToken")))
                   client=newClient();
            }
            
            Map reply=new HashMap();
            reply.put(CHANNEL_ATTR,channel_id);
            if (channel!=null&&data!=null&&_securityPolicy.canSend(client,channel,message))
            {
				/* CAIRO... */
				//System.out.println("\n\nBayeux: PublishHandler(): message: " + message + "\n\n");
				//System.out.println("\n\nBayeux: PublishHandler(): data: " + data + "\n\n");
				Map msg = (Map)data;						//cast the data into a HashMap
				UserBean user = getUser(channel_id);		//user receiving this message (recipient userId is actually the same as the channel_id)
				int eventType = ((Long)msg.get("eventType")).intValue();
				switch(eventType) {
					case Constants.EVENTTYPE_CLEAR_OFFLINE_MESSAGES:
					{
						user.clearMessages();
						break;
					}
					case Constants.EVENTTYPE_GET_USERS:
					{
						getUsers(user);
						break;
					}
					case Constants.EVENTTYPE_USER_CHANGE_STATUS:
					{
						int newStatus = (int)((Long)msg.get("status")).longValue();		//figure out the new status
						user.setStatus(newStatus);										//set the user status to whatever was signalled
						user.setCustomAwayMsg((String)msg.get("customAwayMsg"));		//set the user custom away msg to whatever was signalled
						notifyPartners(user, Constants.EVENTTYPE_USER_CHANGE_STATUS);	//notify partners about status change of this user
						break;
					}
					case Constants.EVENTTYPE_USER_CHANGE_BUDDY_ICON:
					{
						String newBuddyIcon = (String)msg.get("buddyIcon");					//figure out the new buddy icon
						user.setBuddyIcon(newBuddyIcon);									//update the sender user's buddy icon to whatever was sent
						notifyPartners(user, Constants.EVENTTYPE_USER_CHANGE_BUDDY_ICON);	//notify partners about status change of this user
						break;
					}
					case Constants.EVENTTYPE_INCOMING_MESSAGE:	//KEEP THIS AS THE LAST CASE BEFORE DEFAULT CASE!!!
					{
						if(user.getStatus() == Constants.USERSTATUS_OFFLINE) {		//recipient currently offline --> need to store msg
							Map msgStyle     = (Map)msg.get("style");				//cast the msg style into a HashMap
							Map msgTranslate = (Map)msg.get("translate");			//cast the msg style into a HashMap
							String sourceBuddyIcon = getUser( (String)msg.get("source") ).getBuddyIcon();	//figure out source's buddy icon
							MessageStyleBean msb = new MessageStyleBean(msgStyle.get("color"),
								                                        msgStyle.get("fontFamily"),
								                                        msgStyle.get("fontSize"),
								                                        msgStyle.get("fontWeight"),
								                                        msgStyle.get("fontStyle"),
								                                        msgStyle.get("textDecoration"));
							TranslateBean tb = new TranslateBean(msgTranslate.get("enabled"),
								                                 msgTranslate.get("from"),
								                                 msgTranslate.get("to"));
							MessageBean mb = new MessageBean(msg.get("hour"),
								                             msg.get("minute"),
								                             msg.get("source"),
								                             msg.get("target"),
								                             msg.get("message"),
                                                             sourceBuddyIcon,
								                             tb,
								                             msb);
							user.addMessage(mb);
							break;	//note: break here so that this message will not be delivered as it is already stored!
						}			//note: do NOT add else or break; here --> if recipient is not offline, let the default case deliver the message!
					}
					default:
					{
						channel.publish(data);
						reply.put("successful",Boolean.TRUE);
						reply.put("error","");
						break;
					}
				}
			    /* ...CAIRO */

				//This is the original code...
				//
				//channel.publish(data);
				//reply.put("successful",Boolean.TRUE);
				//reply.put("error","");
			}
            else
            {
                reply.put("successful",Boolean.FALSE);
                reply.put("error","unknown channel");
            }
            transport.send(reply);
        }
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class DisconnectHandler implements Handler
    {
        public void handle(Client client, Transport transport, Map message)
        {
        }
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class HandshakeHandler implements Handler
    {
        public void handle(Client client, Transport transport, Map message)
            throws IOException
        {
            if (client!=null)
                throw new IllegalStateException();

            if (_securityPolicy.authenticate((String)message.get("authScheme"),(String)message.get("authUser"),(String)message.get("authToken")))
                client=newClient();

            Map reply=new HashMap();
            reply.put(CHANNEL_ATTR,META_HANDSHAKE);
            reply.put("version",new Double(0.1));
            reply.put("minimumVersion",new Double(0.1));
            
            if (client!=null)
            {
                String connection_id="/meta/connections/"+client.getId();
                Channel channel=new Channel(connection_id,Bayeux.this);
                _channels.put(connection_id,channel);

                reply.put("supportedConnectionTypes",new String[] { "long-polling", "iframe" });
                reply.put("authSuccessful",Boolean.TRUE);
                reply.put(CLIENT_ATTR,client.getId());
                if (_advice!=null)
                    reply.put(ADVICE_ATTR,_advice);
            }
            else
            {
                reply.put("authSuccessful",Boolean.FALSE);
                if (_advice!=null)
                    reply.put(ADVICE_ATTR,_advice);
            }

            transport.send(reply);
        }
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class PingHandler implements Handler
    {
        public void handle(Client client, Transport transport, Map message)
        throws IOException
        {
        }
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class ReconnectHandler implements Handler
    {
        public void handle(Client client, Transport transport, Map message)
        throws IOException
        {
            // TODO check other parameters.

            String connection_id="/meta/connections/"+message.get(CLIENT_ATTR);
            Map reply=new HashMap();
            reply.put(CHANNEL_ATTR,META_RECONNECT);
            reply.put("connectionId",connection_id);
            reply.put("timestamp",_dateCache.format(System.currentTimeMillis()));
            
            if (client==null)
            {
                reply.put("successful",Boolean.FALSE);
                reply.put("error","unknown clientID");
                if (_advice!=null)
                    reply.put(ADVICE_ATTR,_advice);
                transport.setPolling(false);
                transport.send(reply);
            }
            else
            {
                String type=(String)message.get("connectionType");
                if (type!=null)
                    client.setConnectionType(type); 
                reply.put("successful",Boolean.TRUE);
                reply.put("error","");
                transport.setPolling(true);
                transport.send(reply);
            }
        }
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class StatusHandler implements Handler
    {
        public void handle(Client client, Transport transport, Map message)
        throws IOException
        {
        }
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class SubscribeHandler implements Handler
    {
        public void handle(Client client, Transport transport, Map message) 
            throws IOException
        {
            if (client==null)
                throw new IllegalStateException("No client");

            String channel_id=(String)message.get("subscription");

            // select a random channel ID if none specifified
            if (channel_id==null)
            {
                channel_id=Long.toString(getRandom(),36);
                while (getChannel(channel_id)!=null)
                    channel_id=Long.toString(getRandom(),36);
            }

            // get the channel (or create if permitted)
            Channel channel=getChannel(channel_id);
            if (channel==null&&_securityPolicy.canCreate(client,channel,message))
                channel=newChannel(channel_id);

			/* CAIRO... */
			//System.out.println("\n\nSubscribeHandler: channel: <" + channel.getId() + ">:<" + channel.getSubscriberCount() + ">\n\n");
			UserBean user = getUser(channel_id);
			if(user == null) {		//connecting to cairo for the first time with this username
				user = newUser(client.getId(), channel_id);
			} else {				//connected before with this username
				if(user.getStatus() != Constants.USERSTATUS_OFFLINE) {	//check if user already logged in, and if so, invalidate that session!
					//if we are in this block, it means that:
					//	- trying to login with a username that is currently logged in
					//	- client is the new guy, trying to connect right now
					//	- user is the old guy, whose session we need to invalidate now
					StringBuffer buffer = new StringBuffer();
					buffer.append("You have been disconnected because you have signed on\n");
					buffer.append("with this username at another location.\n\n");
					buffer.append("Please login again.");

					HashMap msg = new HashMap();
					msg.put("eventType", Constants.EVENTTYPE_SYSTEM_MESSAGE);
					msg.put("message", buffer.toString());
					channel.publish(msg);
					Client oldClient = getClient(user.getClientId());	//this is the old guy, ie the old client that we need to logout
					channel.removeSubscriber(oldClient);				//invalidate the older client here...  NOTE: user.getClientId() != client.getId()
					_clients.remove(user.getClientId());				//finally remove the old client from the clients HashMap
				}
				user.setStatus(Constants.USERSTATUS_ONLINE);
				user.setClientId(client.getId());
			}
			/* ...CAIRO */

            Map reply=new HashMap();
            reply.put(CHANNEL_ATTR,channel_id);
            reply.put("subscription",channel.getId());
            
            if (channel!=null&&_securityPolicy.canSubscribe(client,channel,message))
            {
                channel.addSubscriber(client);
			    
				/* CAIRO... */
				getUsers(user);				//show logged on partners for this user

                if(user.hasMessages()) {	//there are messages sent to user while offline --> deliver them now!
                    ArrayList messages = user.getMessages();
					HashMap msg = new HashMap();
					msg.put("eventType", Constants.EVENTTYPE_GET_OFFLINE_MESSAGES);
					msg.put("messages", messages);
					channel.publish(msg);
				}

				notifyPartners(user, Constants.EVENTTYPE_USER_CHANGE_STATUS);		//notify partners about status change (login) of this user
			    /* ...CAIRO */

                reply.put("successful",Boolean.TRUE);
                reply.put("error","");
            }
            else
            {
                reply.put("successful",Boolean.FALSE);
                reply.put("error","cannot subscribe");
            }
            transport.send(reply);
		}
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class UnsubscribeHandler implements Handler
    {
        public void handle(Client client, Transport transport, Map message) 
            throws IOException
        {
            if (client==null)
                return;

            String channel_id=(String)message.get("subscription");
            Channel channel=getChannel(channel_id);
            if (channel!=null)
                channel.removeSubscriber(client);

			/* CAIRO... */
			//System.out.println("\n\nUnsubscribeHandler: channel: <" + channel.getId() + ">:<" + channel.getSubscriberCount() + ">\n\n");
			UserBean user = getUser(channel_id);
			if(user != null) {
				user.setStatus(Constants.USERSTATUS_OFFLINE);
				user.setClientId(null);
				notifyPartners(user, Constants.EVENTTYPE_USER_CHANGE_STATUS);	//notify partners about status change (logout) of this user
				//_clients.remove(client.getId());								//finally remove the client from the clients HashMap
			} else {
				System.err.println("\n\nnUnsubscribeHandler: user <" + channel_id + "> is NULL!!\n\n");
			}
			/* ...CAIRO */

            Map reply=new HashMap();
            reply.put(CHANNEL_ATTR,channel_id);
            reply.put("subscription",channel.getId());
            reply.put("successful",Boolean.TRUE);
            reply.put("error","");
            transport.send(reply);
        }
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private static class DefaultPolicy implements SecurityPolicy
    {

        public boolean canCreate(Client client, Channel channel, Map message)
        {
            return client!=null;
            // TODO return !channel.getId().startsWith("/meta/");
        }

        public boolean canSubscribe(Client client, Channel channel, Map message)
        {
            return client!=null;
            // TODO return !channel.getId().startsWith("/meta/");
        }

        public boolean canSend(Client client, Channel channel, Map message)
        {
            return client!=null;
            //TODO return !channel.getId().startsWith("/meta/");
        }

        public boolean authenticate(String scheme, String user, String credentials)
        {
            // TODO Auto-generated method stub
            return true;
        }

    }
}
