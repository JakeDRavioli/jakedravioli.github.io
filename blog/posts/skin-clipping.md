

---

> *"What if… instead of hiding the crime, I just rewrote the law?"*

---

Hey everyone, I hope that everyone had a great weekend. I'm back to talk about the bane of my existence when it comes to making characters - **Skin Clipping**.
You know, that delightful moment where your character's shirt decides to merge with their shoulders and arms like it just discovered true love. *Yeah, that.*

In this post, I'll run through:
- What the problem actually was  
- Why existing solutions didn't feel good enough for me
- How I ended up making my own version of **MToon** to fix it (YES, SERIOUSLY)
- And show you some interesting before/after shots (with blueprint screenshots too!)  

If you’ve read my earlier posts (like ["Why Rebellious Takeover?"](blog.html#/post/why-rebellious-takeover)), or just generally *know* how I am... you already know: I’m a stubborn bastard. If it ain't perfect, it's never perfect. So I fix the most mundane issues, even if it takes me hours to make, and eventually giving in and even letting *AI* tune in to see if it knows what *Reddit* and *Stack Overflow* do not (and also to make sure I don't get a stinky virus or **hundreds of ads** for "***hot cougars in my area***"). So let’s get into it, shall we?

---

## The problem: *the clothes becoming the flesh* (...ew)

By default, *VRoid Studio* exports the **Skin Mask** directly into the VRM model, but it does so while deleting transparent meshes (aka, the meshes you may *need* in the future).  
Which, sounds fine, right? That is until you realise: it only really works properly if you *never* want to change your character's clothes, or just outright remove them. (You know. For *research*.)
Which, let's be honest, that's not the result people want, right? I mean, *unless* you want your character to look like an eldritch mess.

So your character ends up looking like this:

![Before: Lyra's armpit is ever so slightly clipping](/Images/blog/skinclip/lyrano.png)

Notice how you can see *Lyra's* armpit in this picture?

That ain't it. I want my clothes to not clip with the character mesh. God forbid the chest of a female character clips through the clothes and you accidentally get flashed by *big anime tiddies*.

- ...unless you *like* armpits, or being unintentionally flashed. which... uh... I mean, you do you?

---

##  The idea: Runtime Skin Masking, A.K.A: *Fuck it, i'll do it myself*.

Instead of relying on the baked mask, I thought:  
> “What if the shader itself decided, at runtime, *where* to mask the skin?”

This meant:
- The mask is dynamically applied *after* the clothing mesh is placed, meaning that I won't have any *real* polygonal removal, but it'll be transparent to the player, removing ANY clipping if the skin mask is done right
- It can adapt if I tweak the mesh (due to VRoid's uniform UV mapping, which also means the clip masks are universal across all rigs!!)
- I don’t have to go back and re-export from VRoid Studio every damn time.

Basically, it saves me from losing my mind, figuratively and literally.
And keeps the character’s skin looking *crispy clean*, while keeping the ability as a creator to control what things are hidden at what time. Exactly how it should be, and how I wish MToon worked.

![Perfectly balanced, as all things should be.](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGVkdzVpdHVpaTV5eG5mOGxiMGhianl3NjhzeDlzdDJyNGExbTVjdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ry1MOAeAYXvRVQLPw3/giphy.gif)

---

## How I pulled it off (*for the developers*)

Unreal Engine doesn't have VRM support naturally. You have to use VRM4U, A plugin created to port the very much *unity-based* VRM Format to Unreal Engine.
VRM4U uses the **MToon** shader for VRM models, because it's the base for it anywhere it's used, whether in Unity, Godot (*using external plugins*) or Unreal (*once again, using external plugins*).
MToon’s great - It gives a very toony look (*as the name implies*), and it's exactly what I'm looking for, but it doesn't have that beautiful "Skin Mask" texture variable that I want, where I can dynamically change the skin mask instead of VRoid Studio exporting with the skin mask already applied, like a *modifier you never asked for*, but *applied to the export anyway*.

So I dove in and modified the internal material blueprint to:
- Load the skin mask texture dynamically at runtime
- Blend it in using mask logic that respects alpha maps (for example, if the character already *has* transparent textures, like the vertices around the eyebrows, for example)
- And all in all, *keep that anime look* without compromising anything with the visual look.

Here’s what that blueprint spaghetti looked like, which contains the stuff that I modified and added:

![The top of the "Alpha" section of the MToon Base](/Images/blog/skinclip/alphaFunction1.png)
![The bottom of the "Alpha" section of the MToon Base](/Images/blog/skinclip/alphaFunction2.png)

Yes, it looks cursed — but it *works*.  
And that's what matters, right?

---

##  Before & After

Before:  
![Before: clipping is prevelant - You can tell by the fact that nothing under the clothes is culled](/Images/blog/skinclip/before.png#spoiler)

After:  
![After: clipping fixed - You can tell this by the fact that only the neck vertices are visible in this picture](/Images/blog/skinclip/after.png#spoiler)

*No more cursed skin peaks. Clothes stay clothes, Skin stays skin. As nature intended.*

---

##  Why I did it this way

Could I have:
- Just seperated the mesh in Blender and then reapplied it whenever needed?
- Hidden parts of the base mesh in a destructive way?
- Re-exported from VRoid every single change of outfit?

Sure. But that sucks. Like, *reaaaallly* sucks. It sucks so bad that I made it my motive to make a system for *Rebellious Takeover* that makes it as easy as running *one function* to change an outfit or character. *One*. And this helps in that process.

By making it runtime:
- I keep my dev workflow in Unreal (unless exporting a character from VRoid into Blender, then into Unreal via VRM4U)
- Faster workflow *in general* (no re-import hell, I export a character once, and after editing in Blender, hey presto - They're ready for production in Unreal)
- Keeps me from having hundreds of folders for characters - All based on outfits or changes to their attire that are so miniscule it's pointless

Plus, I just like doing weird shader things at 3AM. Gonna be honest.

---
## Bloopers
Of course, things didn't entirely go to plan, did they? I couldn't of made it perfectly - And, truth be told, there was a lot of really funny hurdles along the way. I'm willing to share them here.

So, here's some stupid-looking bloopers.
![Somehow, some bug made everything that <i>didn't</i> have the skin mask, became invisible. Causing... this.](/Images/blog/skinclip/what.png)
![I accidentally inverted the values of the skin mask at one point when realizing I got it right, causing... Bald deren. Baldren. Fear.](/Images/blog/skinclip/baldren.png)

> Pro tip: Each image has a title on it! Click the image to view it, and it'll give you a description.

---

## Final thoughts

If you’re using VRoid in Unreal Engine, and have the same problem I'm having, *you can do this too*.  
It’s genuinely not as scary as it looks sometimes. It is a *big* thing, but that's for a reason - MToon is advanced as *shit*, 
And if you wanna see the blueprint itself, let me know! I may show it off more in a future post or give a link to a "Better MToon" that people can download for their own projects. If you'd use that in your projects, tell me in the comments and I might make a project file for you guys!

Until next time, when I *probably* break something else then *fix it again* powered on nothing but coffee and prayers.

**- Jake**
